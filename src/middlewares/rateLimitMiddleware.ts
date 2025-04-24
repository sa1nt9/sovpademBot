import { MyContext } from "../typescript/context";
import { logger } from "../logger";

// Структура для хранения данных о пользователях
interface UserRateLimit {
    messageCount: number;
    lastReset: number;
    blockedUntil?: number;
}

// Хранилище данных пользователей
const userLimits = new Map<string, UserRateLimit>();

// Настройки ограничений
const RATE_WINDOW = 60 * 1000; // 1 минута
const MAX_MESSAGES = 60; // Максимальное количество сообщений в окно
const BLOCK_DURATION = 2 * 60 * 1000; // 2 минуты блокировки

// Middleware для ограничения запросов
export const rateLimitMiddleware = async (ctx: MyContext, next: () => Promise<void>) => {
    // Пропускаем, если это не сообщение
    if (!ctx.from) {
        return await next();
    }

    const userId = String(ctx.from.id);
    const now = Date.now();

    // Получаем данные пользователя или создаем новые
    if (!userLimits.has(userId)) {
        userLimits.set(userId, {
            messageCount: 0,
            lastReset: now
        });
    }

    const userData = userLimits.get(userId)!;

    // Проверяем, не заблокирован ли пользователь
    if (userData.blockedUntil && userData.blockedUntil > now) {
        const timeLeft = Math.ceil((userData.blockedUntil - now) / 1000);
        
        logger.warn({
            userId,
            blockedUntil: new Date(userData.blockedUntil),
            timeLeft: `${timeLeft}s`
        }, 'User is rate limited');
        
        await ctx.reply(ctx.t('rate_limit_exceeded', { seconds: timeLeft }));
        return;
    }

    // Сбрасываем счетчик, если прошло окно ограничения
    if (now - userData.lastReset > RATE_WINDOW) {
        userData.messageCount = 0;
        userData.lastReset = now;
        delete userData.blockedUntil;
    }

    // Увеличиваем счетчик сообщений
    userData.messageCount++;

    // Проверяем, не превышен ли лимит
    if (userData.messageCount > MAX_MESSAGES) {
        userData.blockedUntil = now + BLOCK_DURATION;
        
        logger.warn({
            userId,
            messageCount: userData.messageCount,
            blockedUntil: new Date(userData.blockedUntil),
            duration: `${BLOCK_DURATION / 1000}s`
        }, 'User exceeded rate limit');
        
        await ctx.reply(ctx.t('rate_limit_exceeded_long', { 
            minutes: Math.ceil(BLOCK_DURATION / 60000) 
        }));
        return;
    }

    // Обновляем данные пользователя в хранилище
    userLimits.set(userId, userData);

    // Периодическая очистка старых записей (каждые 100 запросов)
    if (Math.random() < 0.01) {
        const cutoff = now - (RATE_WINDOW + BLOCK_DURATION);
        
        for (const [id, data] of userLimits.entries()) {
            if (data.lastReset < cutoff && (!data.blockedUntil || data.blockedUntil < now)) {
                userLimits.delete(id);
            }
        }
    }

    await next();
}; 