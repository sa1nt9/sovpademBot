import { MyContext } from '../typescript/context';
import { languages } from "../constants/languages";
import { prepareMessageKeyboard, languageKeyboard } from "../constants/keyboards";

export async function chooseLanguageStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const language = languages.find(i => i.name === message);
    
    if (language) {
        await ctx.i18n.setLocale(language.mark || "ru");
        ctx.session.step = "prepare_message";

        await ctx.reply(ctx.t('lets_start'), {
            reply_markup: prepareMessageKeyboard(ctx.t),
        });
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: languageKeyboard
        });
    }
} 