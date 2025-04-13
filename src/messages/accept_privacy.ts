import { MyContext } from '../typescript/context';
import { acceptPrivacyKeyboard, ageKeyboard, createProfileTypeKeyboard } from "../constants/keyboards";

export async function acceptPrivacyStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ userId, step: 'accept_privacy' }, 'User responding to privacy agreement');
    
    if (message === ctx.t('ok')) {
        ctx.logger.info({ userId }, 'User accepted privacy policy');
        ctx.session.privacyAccepted = true;
        ctx.session.step = "create_profile_type"
        ctx.session.isCreatingProfile = true;

        await ctx.reply(ctx.t('profile_type_title'), {
            reply_markup: createProfileTypeKeyboard(ctx.t)
        });
    } else {
        ctx.logger.warn({ userId, message }, 'User provided invalid response to privacy policy');
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: acceptPrivacyKeyboard(ctx.t),
        });
    }
} 