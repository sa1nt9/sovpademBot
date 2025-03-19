import { MyContext } from '../typescript/context';
import { acceptPrivacyKeyboard, prepareMessageKeyboard } from "../constants/keyboards";

export async function prepareMessageStep(ctx: MyContext) {
    const message = ctx.message!.text;
    
    if (message === ctx.t('ok_lets_start')) {
        ctx.session.step = "accept_privacy";

        await ctx.reply(ctx.t('privacy_message'), {
            reply_markup: acceptPrivacyKeyboard(ctx.t),
        });
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: prepareMessageKeyboard(ctx.t),
        });
    }

} 