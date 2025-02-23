import { Bot, Context } from "grammy";
import * as dotenv from 'dotenv';
import { I18n, I18nFlavor } from "@grammyjs/i18n";
import { languageButtons } from "./constants/languages";
dotenv.config();

console.log(process.env.BOT_TOKEN);

type MyContext = Context & I18nFlavor;

const bot = new Bot<MyContext>(String(process.env.BOT_TOKEN));

const i18n = new I18n<MyContext>({
    defaultLocale: "en",
    directory: "locales",
});
bot.use(i18n);


bot.command("start", (ctx) => {

    ctx.reply(ctx.t('choose_language'), {
        reply_markup: {
            keyboard: languageButtons,
            resize_keyboard: true,
            one_time_keyboard: true,
        }
    })
});

bot.command("language", (ctx) => {

    ctx.reply(ctx.t('choose_language'), {
        reply_markup: {
            keyboard: languageButtons,
            resize_keyboard: true,
            one_time_keyboard: true,
        }
    })
});

bot.on("message", async (ctx) => {
    const message = ctx.message.text;

    if (languageButtons.some(button => button[0] === message || button.some(i => i === message))) {
        await ctx.reply(ctx.t('lets_start'), {
            reply_markup: {
                keyboard: [],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        });
    } else {
        await ctx.reply(ctx.t('no_such_answer'));
    }
});


bot.start();
