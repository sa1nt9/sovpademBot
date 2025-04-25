import { logger } from './logger';
import { Bot, session } from "grammy";
import * as dotenv from 'dotenv';
import { sessionInitial } from "./functions/sessionInitial";
import { errorHandler } from "./handlers/error";
import { i18n } from './i18n';
import { connectPostgres, prisma } from './db/postgres';
import { MyContext } from './typescript/context';
import { checkSubscriptionMiddleware } from './middlewares/checkSubscriptionMiddleware';
import { PrismaAdapter } from '@grammyjs/storage-prisma';
import { myprofileCommand } from './commands/myprofile';
import { languageCommand } from './commands/language';
import { deactivateCommand } from './commands/deactivate';
import { startCommand } from './commands/start';
import { complainCommand } from './commands/complain';
import { rouletteCommand } from './commands/roulette';
import { messageEvent } from './events/message';
import { callbackQueryEvent } from './events/callback_query';
import { rouletteMiddleware } from './middlewares/rouletteMiddleware';
import { stopRouletteCommand } from './commands/stop_roulette';
import { statsCommand } from './commands/stats';
import { blacklistCommand } from './commands/blacklist';
import { addToBlacklistCommand } from './commands/add_to_blacklist';
import { matchesCommand } from './commands/matches';
import { inlineQueryEvent } from './events/inline_query';
import { switchCommand } from './commands/switch';
import { changeSessionFieldsMiddleware } from './middlewares/changeSessionFieldsMiddleware';
import { newLikesCommand } from './commands/new_likes';
import { moderateReportsCommand } from './commands/moderate_reports';
// Импортируем очереди
import { initQueues } from './queues/initQueues';
// Импортируем webhook
import { setupWebhook } from './webhook';
import { checkForBanMiddleware } from './middlewares/checkForBanMiddleware';
import { reviewNewProfilesCommand } from './commands/review_new_profiles';
import { rateLimitMiddleware } from './middlewares/rateLimitMiddleware';

dotenv.config();
// Определяем режим запуска (production или development)
const isProduction = process.env.NODE_ENV === 'production';

export const bot = new Bot<MyContext>(String(isProduction ? process.env.BOT_TOKEN : process.env.BOT_TOKEN_DEV));


async function startBot() {
    try {
        logger.info('Connecting to database...');
        await connectPostgres();
        logger.info('Database connection established');

        // Инициализация очередей
        initQueues();

        bot.catch(errorHandler);

        // Middleware для добавления логгера в контекст
        bot.use(async (ctx, next) => {
            ctx.logger = logger;
            await next();
        });

        const sessionMiddleware = session({
            initial: sessionInitial,
            storage: new PrismaAdapter(prisma.session),
        } as any);

        bot.use(async (ctx, next) => {
            if (ctx.inlineQuery) {
                return next();
            }
            return sessionMiddleware(ctx, next);
        });

        bot.use(async (ctx, next) => {
            if (ctx.inlineQuery) {
                return i18n(true).middleware()(ctx, next);
            }
            return i18n(false).middleware()(ctx, next);
        });

        bot.use(checkSubscriptionMiddleware);
        bot.use(rouletteMiddleware);
        bot.use(checkForBanMiddleware);
        bot.use(changeSessionFieldsMiddleware);
        bot.use(rateLimitMiddleware);

        // Регистрация команд
        bot.command("start", startCommand);
        bot.command("myprofile", myprofileCommand);
        bot.command("switch", switchCommand);
        bot.command("roulette", rouletteCommand);
        bot.command("blacklist", blacklistCommand);
        bot.command("matches", matchesCommand);
        bot.command("add_to_blacklist", addToBlacklistCommand);
        bot.command("new_likes", newLikesCommand);
        bot.command("complain", complainCommand);
        bot.command("stats", statsCommand);
        bot.command("stop_roulette", stopRouletteCommand);
        bot.command("language", languageCommand);
        bot.command("deactivate", deactivateCommand);
        bot.command("m1", moderateReportsCommand);
        bot.command("m2", reviewNewProfilesCommand);


        // Регистрация обработчиков событий
        bot.on("message", messageEvent);
        bot.on("callback_query", callbackQueryEvent);
        bot.on("inline_query", inlineQueryEvent);

        logger.info('Bot configured successfully');

        // Запускаем бота в зависимости от режима
        if (isProduction) {
            // В production используем webhook
            logger.info('Starting bot in production mode with webhook');
            
            // Получаем WEBHOOK_PORT из переменных окружения или используем 3000 по умолчанию
            const port = Number(process.env.WEBHOOK_PORT) || 3000;
            
            // Настраиваем webhook
            const webhook = setupWebhook(bot);
            
            // Запускаем Express сервер
            await webhook.startServer(port);
            
            // Устанавливаем webhook в Telegram API
            await webhook.setWebhook();
            
            logger.info('Bot started successfully with webhook');
        } else {
            // В development используем long polling
            logger.info('Starting bot in development mode with long polling');
            await bot.start();
            logger.info('Bot started successfully with long polling');
        }
    } catch (error) {
        logger.error({ error }, 'Failed to start bot');
        throw error;
    }
}

startBot().catch((error) => {
    logger.error({ error }, 'Fatal error during bot startup');
    process.exit(1);
});

bot.api.editMessageCaption(
    "@sovpadem",
    8,
    {
      caption: `🔥 Добро пожаловать в "Совпадём?"!
  
Здесь ты найдешь:
• Новых друзей и интересных собеседников
• Новости <a href="http://t.me/sovpadembot?start=s_zakrep_tg">нашего бота знакомств</a>
• Полезные советы для общения
  
<a href="http://t.me/sovpadembot?start=s_zakrep_tg">Наш бот</a> поможет тебе найти человека по душе — просто, быстро и без лишних сложностей.
<a href="http://t.me/sovpadembot?start=s_zakrep_tg">👉 Попробуй прямо сейчас 👈</a>
<a href="http://t.me/sovpadembot?start=s_zakrep_tg">👉 Попробуй прямо сейчас 👈</a>
<a href="http://t.me/sovpadembot?start=s_zakrep_tg">👉 Попробуй прямо сейчас 👈</a>

Подписывайся на канал и не пропускай обновления! 💫`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Запустить бота",
              url: "https://t.me/sovpadembot?start=s_zakrep_tg"
            }
          ]
        ]
      }
    }
  );