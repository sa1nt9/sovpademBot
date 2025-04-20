import { MyContext } from '../typescript/context';
import { acceptPrivacyKeyboard, prepareMessageKeyboard } from "../constants/keyboards";

export async function prepareMessageStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ userId, step: 'prepare_message' }, 'User on introduction screen');
    
    if (message === ctx.t('ok_lets_start')) {
        ctx.logger.info({ userId }, 'User confirming start of onboarding process');
        ctx.session.step = "accept_privacy";

        await ctx.reply(ctx.t('privacy_message'), {
            reply_markup: acceptPrivacyKeyboard(ctx.t),
            parse_mode: "Markdown"
        });
    } else {
        ctx.logger.warn({ userId, invalidOption: message }, 'User provided invalid response on introduction screen');
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: prepareMessageKeyboard(ctx.t),
        });
    }

} 