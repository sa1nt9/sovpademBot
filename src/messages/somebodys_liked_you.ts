import { answerLikesFormKeyboard, deactivateProfileKeyboard, somebodysLikedYouKeyboard } from '../constants/keyboards';
import { getOneLike } from '../functions/db/getOneLike';
import { getUserProfiles } from '../functions/db/profilesService';
import { sendForm } from '../functions/sendForm';
import { MyContext } from '../typescript/context';

export async function somebodysLikedYouStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ userId }, 'Processing likes notification');

    if (message === '1 👍') {
        ctx.session.step = 'search_people_with_likes'
        ctx.session.additionalFormInfo.searchingLikes = true

        const oneLike = await getOneLike(userId, 'user');

        ctx.session.currentCandidateProfile = oneLike?.fromProfile

        await ctx.reply("✨🔍", {
            reply_markup: answerLikesFormKeyboard()
        });

        if (oneLike?.fromProfile) {
            await sendForm(ctx, oneLike.fromProfile.user, { myForm: false, like: oneLike });
            ctx.logger.info({ userId, likesCount: 1 }, 'Sent likes notification');
        }

    } else if (message === '2 💤') {
        ctx.session.step = 'disable_form'

        const profiles = await getUserProfiles(userId, ctx);

        await ctx.reply(ctx.t('are_you_sure_you_want_to_disable_your_form'), {
            reply_markup: deactivateProfileKeyboard(ctx.t, profiles)
        })
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: somebodysLikedYouKeyboard()
        });
    }
} 