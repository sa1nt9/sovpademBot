import { answerFormKeyboard, answerLikesFormKeyboard, continueKeyboard, continueSeeFormsKeyboard } from "../constants/keyboards";
import { MyContext } from "../typescript/context";
import { getOneLike } from "./db/getOneLike";
import { sendForm } from "./sendForm";
import { sendMutualSympathyAfterAnswer } from "./sendMutualSympathyAfterAnswer";

export const continueSeeLikesForms = async (ctx: MyContext) => {
    const userId = String(ctx.from!.id);
    ctx.logger.info({ userId }, 'Continuing to see likes forms');
    
    const oneLike = await getOneLike(userId, 'user');

    if (oneLike?.fromProfile) {
        if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
            ctx.logger.info({ userId }, 'Processing pending mutual like');
            await sendMutualSympathyAfterAnswer(ctx, { withoutSleepMenu: true })
            ctx.session.step = 'continue_see_likes_forms'
            return
        }

        ctx.logger.info({ 
            userId, 
            fromProfileId: oneLike.fromProfile.id 
        }, 'Showing like form');
        
        await ctx.reply("✨🔍", {
            reply_markup: answerLikesFormKeyboard()
        });

        ctx.session.currentCandidateProfile = oneLike.fromProfile
        await sendForm(ctx, oneLike.fromProfile, { myForm: false, like: oneLike });
    } else {
        if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
            ctx.logger.info({ userId }, 'Processing pending mutual like');
            await sendMutualSympathyAfterAnswer(ctx, { withoutSleepMenu: true })
        }

        ctx.logger.info({ userId }, 'No more likes to show');
        ctx.session.step = 'continue_see_forms'
        ctx.session.additionalFormInfo.searchingLikes = false

        await ctx.reply(ctx.t('its_all_go_next_question'), {
            reply_markup: continueKeyboard(ctx.t)
        });
    }
}

