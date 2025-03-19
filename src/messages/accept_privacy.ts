import { MyContext } from '../typescript/context';
import { acceptPrivacyKeyboard, ageKeyboard } from "../constants/keyboards";

export async function acceptPrivacyStep(ctx: MyContext) {
    const message = ctx.message!.text;
    
    if (message === ctx.t('ok')) {
        ctx.session.privacyAccepted = true;
        ctx.session.step = "questions";
        ctx.session.question = 'years'

        await ctx.reply(ctx.t('years_question'), {
            reply_markup: ageKeyboard(ctx.session)
        });
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: acceptPrivacyKeyboard(ctx.t),
        });
    }
} 