import { acceptPrivacyKeyboard, ageKeyboard, createProfileTypeKeyboard, notHaveFormToDeactiveKeyboard } from '../constants/keyboards';
import { MyContext } from '../typescript/context';

export async function youDontHaveFormStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ userId, step: 'you_dont_have_form' }, 'User trying to use feature without having a profile');
    
    if (message === ctx.t('create_form')) {
        ctx.logger.info({ userId }, 'User decided to create profile');
        
        if (ctx.session.privacyAccepted) {
            ctx.logger.info({ userId, privacyAccepted: true }, 'Privacy already accepted, proceeding to profile type selection');
            ctx.session.step = "create_profile_type"
            ctx.session.isCreatingProfile = true;

            await ctx.reply(ctx.t('profile_type_title'), {
                reply_markup: createProfileTypeKeyboard(ctx.t)
            });
        } else {
            ctx.logger.info({ userId, privacyAccepted: false }, 'Privacy not accepted, redirecting to privacy agreement');
            ctx.session.step = "accept_privacy";

            await ctx.reply(ctx.t('privacy_message'), {
                reply_markup: acceptPrivacyKeyboard(ctx.t),
            });
        }
    } else {
        ctx.logger.warn({ userId, invalidOption: message }, 'User provided invalid response on no-form screen');
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: notHaveFormToDeactiveKeyboard(ctx.t)
        });
    }
} 