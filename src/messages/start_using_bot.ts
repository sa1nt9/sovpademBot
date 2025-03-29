import { acceptPrivacyKeyboard, ageKeyboard, answerFormKeyboard, languageKeyboard, mainMenuKeyboard, profileKeyboard } from '../constants/keyboards';
import { sendForm } from '../functions/sendForm';
import { MyContext } from '../typescript/context';

export async function startUsingBotStep(ctx: MyContext) {

    if (ctx.session.privacyAccepted) {
        ctx.session.step = "questions";
        ctx.session.question = 'years'

        await ctx.reply(ctx.t('years_question'), {
            reply_markup: ageKeyboard(ctx.session)
        });
    } else {
        ctx.session.step = "choose_language_start";

        await ctx.reply(ctx.t('choose_language'), {
            reply_markup: languageKeyboard
        })
    }
} 