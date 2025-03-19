import { acceptPrivacyKeyboard, ageKeyboard, notHaveFormToDeactiveKeyboard } from '../constants/keyboards';
import { MyContext } from '../typescript/context';

export async function youDontHaveFormStep(ctx: MyContext) {
    const message = ctx.message!.text;
    
    if (message === ctx.t('create_form')) {
        if (ctx.session.privacyAccepted) {
            ctx.session.step = "questions";
            ctx.session.question = 'years'

            await ctx.reply(ctx.t('years_question'), {
                reply_markup: ageKeyboard(ctx.session)
            });
        } else {
            ctx.session.step = "accept_privacy";

            await ctx.reply(ctx.t('privacy_message'), {
                reply_markup: acceptPrivacyKeyboard(ctx.t),
            });
        }
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: notHaveFormToDeactiveKeyboard(ctx.t)
        });
    }
} 