import { answerLikesFormKeyboard, disableFormKeyboard, somebodysLikedYouKeyboard } from '../constants/keyboards';
import { getOneLike } from '../functions/db/getOneLike';
import { sendForm } from '../functions/sendForm';
import { MyContext } from '../typescript/context';

export async function somebodysLikedYouStep(ctx: MyContext) {
    const message = ctx.message!.text;
    
    if (message === '1 👍') {
        ctx.session.step = 'search_people_with_likes'
        ctx.session.additionalFormInfo.searchingLikes = true

        const oneLike = await getOneLike(String(ctx.from!.id));

        ctx.session.currentCandidate = oneLike?.user

        await ctx.reply("✨🔍", {
            reply_markup: answerLikesFormKeyboard()
        });

        if (oneLike?.user) {
            await sendForm(ctx, oneLike.user, { myForm: false, like: oneLike });
        }

    } else if (message === '2 💤') {
        ctx.session.step = 'disable_form'

        await ctx.reply(ctx.t('are_you_sure_you_want_to_disable_your_form'), {
            reply_markup: disableFormKeyboard()
        })
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: somebodysLikedYouKeyboard()
        });
    }
} 