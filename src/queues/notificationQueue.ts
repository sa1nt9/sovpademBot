import Queue from 'bull';
import { bot } from '../main';
import { prisma } from '../db/postgres';
import { logger } from '../logger';
import { bullConfig } from './config';
import { createNotificationContext } from './utils';
import { sendNotificationDirectly } from '../functions/sendNotificationDirectly';
import { ILikeNotificationData } from '../typescript/interfaces/ILikeNotificationData';

// Создаем очередь для уведомлений
export const notificationQueue = new Queue<ILikeNotificationData>('notifications', bullConfig);

// Обработчик задач в очереди
notificationQueue.process(async (job) => {
    const { targetUserId, fromUserId, isAnswer, notificationId, targetProfileId, fromProfileId, profileType } = job.data;

    logger.info({
        targetUserId,
        fromUserId,
        isAnswer,
        notificationId,
        targetProfileId,
        fromProfileId,
        jobId: job.id
    }, 'Processing notification job');

    try {
        // Получаем уведомление из базы данных
        const notification = await prisma.pendingNotification.findUnique({
            where: { id: notificationId }
        });

        // Если уведомление не найдено или уже отправлено
        if (!notification || notification.status !== 'pending') {
            logger.info({
                notificationId,
                status: notification?.status
            }, 'Notification already processed or not found');
            return { success: true, message: 'Notification already processed' };
        }

        // Проверяем, можно ли отправить уведомление (прошло ли достаточно времени)
        const canSendNotification = await checkUserActivity(targetUserId, isAnswer);

        if (!canSendNotification) {
            // Если пользователь активен, откладываем уведомление на 10 минут
            logger.info({
                targetUserId,
                fromUserId,
                targetProfileId,
                fromProfileId,
                notificationId
            }, 'User is active, rescheduling notification');

            // Обновляем время последней попытки
            await prisma.pendingNotification.update({
                where: { id: notificationId },
                data: { lastAttempt: new Date() }
            });

            // Планируем повторную попытку через 10 минут
            // Создаем новую задачу с задержкой
            await notificationQueue.add(
                job.data,
                { delay: 5 * 60 * 1000 } // 10 минут в миллисекундах
            );
            
            return { success: false, reschedule: true };
        }

        // Создаем контекст для отправки уведомления
        const ctx = await createNotificationContext(bot, fromUserId);
        
        // Отправляем уведомление
        await sendNotificationDirectly(ctx, targetUserId, fromUserId, targetProfileId, fromProfileId, profileType, isAnswer);

        // Обновляем статус уведомления
        await prisma.pendingNotification.update({
            where: { id: notificationId },
            data: { status: 'sent' }
        });

        logger.info({   
            targetUserId,
            fromUserId,
            targetProfileId,
            fromProfileId,
            notificationId
        }, 'Notification sent successfully');

        return { success: true };
    } catch (error) {
        logger.error({
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            targetUserId,
            fromUserId,
            targetProfileId,
            fromProfileId,
            notificationId
        }, 'Error processing notification job');

        // Если задача уже выполнилась максимальное количество попыток,
        // помечаем уведомление как failed
        if (job.attemptsMade >= 3) { // Используем явное значение вместо конфигурации
            await prisma.pendingNotification.update({
                where: { id: notificationId },
                data: { status: 'failed' }
            });
        }

        throw error;
    }
});

// Функция для проверки активности пользователя
async function checkUserActivity(userId: string, checkOnlyRoulette: boolean = false): Promise<boolean> {
    try {
        // Получаем последнюю сессию пользователя
        const session = await prisma.session.findUnique({
            where: { key: userId },
            select: {
                updatedAt: true
            }
        });

        if (!session) {
            return true; // Если сессии нет, считаем что пользователь неактивен
        }

        // Проверяем статус в рулетке
        const rouletteUser = await prisma.rouletteUser.findUnique({
            where: { id: userId },
            select: {
                searchingPartner: true,
                chatPartnerId: true
            }
        });

        // Если пользователь в активном поиске в рулетке, откладываем уведомление
        if (rouletteUser?.searchingPartner || rouletteUser?.chatPartnerId) {
            logger.info({
                userId,
                searchingPartner: rouletteUser?.searchingPartner,
                chatPartnerId: rouletteUser?.chatPartnerId
            }, 'User is searching for partner in roulette, delaying notification');
            return false;
        } else {
            if (checkOnlyRoulette) {
                return true;
            }
        }

        // Проверяем, прошло ли 5 минут с последней активности
        const now = new Date();
        const lastActivityTime = session.updatedAt;
        const diffInMinutes = (now.getTime() - lastActivityTime.getTime()) / (1000 * 60);
        
        // Если прошло менее 5 минут с последней активности и не находится в поиске, откладываем уведомление
        if (diffInMinutes < 5) {
            logger.info({
                userId,
                lastActivityTime,
                diffInMinutes,
                threshold: 5
            }, 'User was active recently, delaying notification');
            return false;
        }
        
        logger.info({
            userId,
            lastActivityTime,
            diffInMinutes,
            threshold: 5
        }, 'User inactive for more than 5 minutes, can send notification');
        
        return true; // Пользователь неактивен достаточно долго, можно отправлять
    } catch (error) {
        logger.error({
            error: error instanceof Error ? error.message : 'Unknown error',
            userId
        }, 'Error checking user activity');
        
        return true; // В случае ошибки, считаем пользователя неактивным
    }
} 