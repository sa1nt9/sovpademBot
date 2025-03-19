import { answerFormKeyboard, answerLikesFormKeyboard } from '../constants/keyboards';
import { getCandidate } from '../functions/db/getCandidate';
import { getOneLike } from '../functions/db/getOneLike';
import { sendForm } from '../functions/sendForm';
import { MyContext } from '../typescript/context';

export async function continueSeeLikesFormsStep(ctx: MyContext) {
    ctx.session.step = 'search_people_with_likes'
    ctx.session.additionalFormInfo.searchingLikes = true

    const oneLike = await getOneLike(String(ctx.from!.id));


    if (oneLike?.user) {
        await ctx.reply("✨🔍", {
            reply_markup: answerLikesFormKeyboard()
        });

        await sendForm(ctx, oneLike.user, { myForm: false, like: oneLike });
    } else {
        ctx.session.step = 'search_people'
        ctx.session.additionalFormInfo.searchingLikes = false

        await ctx.reply("✨🔍", {
            reply_markup: answerFormKeyboard()
        });

        const candidate = await getCandidate(ctx)
        ctx.logger.info(candidate, 'This is new candidate')

        await sendForm(ctx, candidate || null, { myForm: false })
    }
} 