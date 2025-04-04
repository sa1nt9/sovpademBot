import { createProfileTypeKeyboard, languageKeyboard } from '../constants/keyboards';
import { sendForm } from '../functions/sendForm';
import { MyContext } from '../typescript/context';

export async function startUsingBotStep(ctx: MyContext) {

    if (ctx.session.privacyAccepted) {
        ctx.session.step = "create_profile_type"

        await ctx.reply(ctx.t('profile_type_title'), {
            reply_markup: createProfileTypeKeyboard(ctx.t)
        });
    } else {
        ctx.session.step = "choose_language_start";

        await ctx.reply(ctx.t('choose_language'), {
            reply_markup: languageKeyboard
        })
    }
} 