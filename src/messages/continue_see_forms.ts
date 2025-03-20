import { answerFormKeyboard } from '../constants/keyboards';
import { getCandidate } from '../functions/db/getCandidate';
import { sendForm } from '../functions/sendForm';
import { MyContext } from '../typescript/context';

export async function continueSeeFormsStep(ctx: MyContext) {
    ctx.session.step = 'search_people'
    ctx.session.question = 'years'

    await ctx.reply("✨🔍", {
        reply_markup: answerFormKeyboard()
    });

    const candidate = await getCandidate(ctx)
    ctx.logger.info(candidate, 'This is new candidate')

    await sendForm(ctx, candidate || null, { myForm: false })

} 