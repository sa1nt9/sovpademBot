import { acceptPrivacyKeyboard, ageKeyboard, createProfileTypeKeyboard, notHaveFormToDeactiveKeyboard } from '../constants/keyboards';
import { MyContext } from '../typescript/context';

export async function youDontHaveFormStep(ctx: MyContext) {
    const message = ctx.message!.text;
    
    if (message === ctx.t('create_form')) {
        if (ctx.session.privacyAccepted) {
            ctx.session.step = "create_profile_type"

            await ctx.reply(ctx.t('profile_type_title'), {
                reply_markup: createProfileTypeKeyboard(ctx.t)
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