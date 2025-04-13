import { MyContext } from '../typescript/context';
import { languages } from "../constants/languages";
import { prepareMessageKeyboard, languageKeyboard } from "../constants/keyboards";

export async function chooseLanguageStartStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const language = languages.find(i => i.name === message);
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ userId, step: 'choose_language_start', selectedLanguage: message }, 'User selecting initial language');
    
    if (language) {
        ctx.logger.info({ userId, languageCode: language.mark }, 'Initial language selected successfully');
        await ctx.i18n.setLocale(language.mark || "ru");
        ctx.session.step = "prepare_message";

        await ctx.reply(ctx.t('lets_start'), {
            reply_markup: prepareMessageKeyboard(ctx.t),
        });
    } else {
        ctx.logger.warn({ userId, invalidLanguage: message }, 'User selected invalid initial language option');
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: languageKeyboard
        });
    }
    
}
