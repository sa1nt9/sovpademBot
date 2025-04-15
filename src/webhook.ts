import { Bot, webhookCallback } from "grammy";
import express from "express";
import { logger } from './logger';
import { MyContext } from './typescript/context';

export function setupWebhook(bot: Bot<MyContext>) {
    const app = express();
    
    // Проверяем наличие необходимых переменных окружения
    const { BOT_DOMAIN, BOT_TOKEN, WEBHOOK_PATH } = process.env;
    
    if (!BOT_DOMAIN) {
        throw new Error("BOT_DOMAIN is not set in environment variables");
    }
    
    if (!WEBHOOK_PATH) {
        throw new Error("WEBHOOK_PATH is not set in environment variables");
    }
    
    // Настраиваем парсинг JSON
    app.use(express.json());
    
    // Эндпоинт для вебхука Telegram
    app.use(WEBHOOK_PATH, webhookCallback(bot, "express"));
    
    // Эндпоинт для проверки работоспособности
    app.get('/health', (req: any, res: any) => {
        res.status(200).send({ status: 'ok' });
    });
    
    // Настраиваем веб-хук в Telegram API
    const webhookUrl = `https://${BOT_DOMAIN}${WEBHOOK_PATH}`;
    
    return {
        app,
        
        // Функция для установки вебхука
        async setWebhook() {
            try {
                await bot.api.setWebhook(webhookUrl);
                logger.info(`Webhook set to: ${webhookUrl}`);
                
                // Проверяем информацию о вебхуке
                const info = await bot.api.getWebhookInfo();
                logger.info('Webhook info:', info);
                
                if (info.url !== webhookUrl) {
                    logger.warn(`Warning: webhook URL mismatch. Expected: ${webhookUrl}, Got: ${info.url}`);
                }
                
                if (info.pending_update_count > 0) {
                    logger.info(`There are ${info.pending_update_count} pending updates`);
                }
                
                return info;
            } catch (error) {
                logger.error({ error }, 'Failed to set webhook');
                throw error;
            }
        },
        
        // Функция для запуска Express сервера
        startServer(port = 3000) {
            return new Promise<void>((resolve) => {
                app.listen(port, () => {
                    logger.info(`Webhook server is running on port ${port}`);
                    resolve();
                });
            });
        }
    };
} 