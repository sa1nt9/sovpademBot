import { MyContext } from '../typescript/context';
import { acceptPrivacyKeyboard, ageKeyboard, createProfileTypeKeyboard } from "../constants/keyboards";

export async function acceptPrivacyStep(ctx: MyContext) {
    const message = ctx.message!.text;
    
    if (message === ctx.t('ok')) {
        ctx.session.privacyAccepted = true;
        ctx.session.step = "create_profile_type"

        await ctx.reply(ctx.t('profile_type_title'), {
            reply_markup: createProfileTypeKeyboard(ctx.t)
        });
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: acceptPrivacyKeyboard(ctx.t),
        });
    }
} 