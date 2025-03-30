import { answerFormKeyboard, answerLikesFormKeyboard, continueKeyboard, continueSeeFormsKeyboard } from "../constants/keyboards";
import { MyContext } from "../typescript/context";
import { getOneLike } from "./db/getOneLike";
import { sendForm } from "./sendForm";
import { sendMutualSympathyAfterAnswer } from "./sendMutualSympathyAfterAnswer";

export const continueSeeLikesForms = async (ctx: MyContext) => {
    const oneLike = await getOneLike(String(ctx.from!.id), ctx.session.activeProfile.profileType, ctx.session.activeProfile.id);


    if (oneLike?.fromProfile) {
        if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
            await sendMutualSympathyAfterAnswer(ctx, { withoutSleepMenu: true })
            ctx.session.step = 'continue_see_likes_forms'
            return
        }

        await ctx.reply("✨🔍", {
            reply_markup: answerLikesFormKeyboard()
        });

        ctx.session.currentCandidateProfile = oneLike.fromProfile
        await sendForm(ctx, oneLike.fromProfile, { myForm: false, like: oneLike });
    } else {
        if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
            await sendMutualSympathyAfterAnswer(ctx, { withoutSleepMenu: true })
        }

        ctx.session.step = 'continue_see_forms'
        ctx.session.additionalFormInfo.searchingLikes = false

        await ctx.reply(ctx.t('its_all_go_next_question'), {
            reply_markup: continueKeyboard(ctx.t)
        });
    }
}

