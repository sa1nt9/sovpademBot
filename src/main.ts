import { logger } from './logger';
import { Bot, session } from "grammy";
import * as dotenv from 'dotenv';
import { complainKeyboard, rouletteKeyboard } from "./constants/keyboards";
import { sessionInitial } from "./functions/sessionInitial";
import { sendForm } from "./functions/sendForm";
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

dotenv.config();

export const bot = new Bot<MyContext>(String(process.env.BOT_TOKEN));


async function startBot() {

    await connectPostgres()


    bot.catch(errorHandler);


    bot.use(async (ctx, next) => {
        ctx.logger = logger

        await next()
    })

    bot.use(
        session({
            initial: sessionInitial,
            storage: new PrismaAdapter(prisma.session),
        })
    );

    bot.use(i18n);

    bot.use(checkSubscriptionMiddleware)

    bot.use(rouletteMiddleware)


    bot.command("start", startCommand);

    bot.command("myprofile", myprofileCommand);
    
    bot.command("roulette", rouletteCommand);
    
    bot.command("blacklist", blacklistCommand);
    
    bot.command("complain", complainCommand);

    bot.command("stats", statsCommand);

    bot.command("stop_roulette", stopRouletteCommand);

    bot.command("language", languageCommand);
    
    bot.command("deactivate", deactivateCommand);
    

    bot.on("message", messageEvent);

    bot.on("callback_query", callbackQueryEvent);


    bot.start();
}


startBot().then(() => {
    console.log('Bot started');
})