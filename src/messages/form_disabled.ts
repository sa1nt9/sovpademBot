import { answerFormKeyboard, disableFormKeyboard, profileKeyboard } from '../constants/keyboards';
import { candidatesEnded } from '../functions/candidatesEnded';
import { getCandidate } from '../functions/db/getCandidate';
import { sendForm } from '../functions/sendForm';
import { MyContext } from '../typescript/context';

export async function formDisabledStep(ctx: MyContext) {
    const message = ctx.message!.text;
    
    if (message === ctx.t("search_people")) {
        ctx.session.step = 'search_people'

        await ctx.reply("✨🔍", {
            reply_markup: answerFormKeyboard()
        });

        const candidate = await getCandidate(ctx)
        ctx.logger.info(candidate, 'This is new candidate')

        if (candidate) {
            await sendForm(ctx, candidate || null, { myForm: false })   
        } else {
            await candidatesEnded(ctx)
        }

    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: disableFormKeyboard()
        });
    }
} 