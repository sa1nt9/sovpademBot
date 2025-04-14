import { Bot } from 'grammy';
import { MyContext } from '../typescript/context';
import { logger } from '../logger';
import { prisma } from '../db/postgres';
import { ILikeNotificationData } from '../typescript/interfaces/ILikeNotificationData';
import { NotificationType } from '@prisma/client';
import { notificationQueue } from './notificationQueue';

export async function createNotificationContext(bot: Bot<MyContext>, fromUserId: string): Promise<MyContext> {

    const session = await prisma.session.findUnique({
        where: { key: fromUserId },
        select: {
            value: true
        }
    });

    const value = JSON.parse(session?.value || '{}');

    const ctx = {
        api: bot.api,
        logger: logger,
        from: { id: parseInt(fromUserId) },
        session: value
    } as MyContext;

    return ctx;
}

interface IScheduleNotificationOptions {
    isAnswer?: boolean
    delay?: number
}

export async function scheduleNotification(
    targetUserId: string,
    fromUserId: string,
    type: NotificationType,
    options: IScheduleNotificationOptions
): Promise<string> {
    try {
        // Создаем запись в базе данных
        const notification = await prisma.pendingNotification.create({
            data: {
                userId: targetUserId,
                type: type,
                data: {
                    fromUserId,
                    isAnswer: !!options.isAnswer,
                },
                status: 'pending'
            }
        });

        // Добавляем задачу в очередь
        const job = await notificationQueue.add({
            targetUserId,
            fromUserId,
            isAnswer: !!options.isAnswer,
            notificationId: notification.id,
            delay: options.delay
        } as ILikeNotificationData);

        logger.info({
            targetUserId,
            fromUserId,
            notificationId: notification.id,
            jobId: job.id,
            type
        }, 'Notification scheduled');

        return notification.id;
    } catch (error) {
        logger.error({
            error: error instanceof Error ? error.message : 'Unknown error',
            targetUserId,
            fromUserId,
            type
        }, 'Error scheduling notification');
        
        throw error;
    }
} 