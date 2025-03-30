import { answerFormKeyboard, continueSeeFormsKeyboard, goBackKeyboard, profileKeyboard, textOrVideoKeyboard, optionsToUserKeyboard } from '../constants/keyboards';
import { getCandidate } from '../functions/db/getCandidate';
import { saveLike } from '../functions/db/saveLike';
import { sendForm } from '../functions/sendForm';
import { sendLikesNotification } from '../functions/sendLikesNotification';
import { MyContext } from '../typescript/context';
import { sendMutualSympathyAfterAnswer } from '../functions/sendMutualSympathyAfterAnswer';
import { candidatesEnded } from '../functions/candidatesEnded';
export async function searchPeopleStep(ctx: MyContext) {
    const message = ctx.message!.text;

    if (message === '❤️') {
        if (ctx.session.currentCandidateProfile) {
            await saveLike(ctx, ctx.session.currentCandidateProfile.id, true);
            await sendLikesNotification(ctx, ctx.session.currentCandidateProfile.id);

            // Проверяем наличие отложенной взаимной симпатии
            if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
                await sendMutualSympathyAfterAnswer(ctx)
                return
            }
        }

        const candidate = await getCandidate(ctx)
        ctx.logger.info(candidate, 'This is new candidate')

        if (candidate) {
            await sendForm(ctx, candidate || null, { myForm: false })
        } else {
            await candidatesEnded(ctx)
        }

    } else if (message === '💌/📹') {
        ctx.session.step = 'text_or_video_to_user'
        ctx.session.additionalFormInfo.awaitingLikeContent = true;

        await ctx.reply(ctx.t('text_or_video_to_user'), {
            reply_markup: textOrVideoKeyboard(ctx.t)
        })

    } else if (message === '👎') {
        if (ctx.session.currentCandidateProfile) {
            await saveLike(ctx, ctx.session.currentCandidateProfile.id, false);

            if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
                await sendMutualSympathyAfterAnswer(ctx)
                return
            }
        }


        const candidate = await getCandidate(ctx)
        ctx.logger.info(candidate, 'This is new candidate')
        if (candidate) {
            await sendForm(ctx, candidate || null, { myForm: false })
        } else {
            await candidatesEnded(ctx)
        }

    } else if (message === '📋') {
        ctx.session.step = 'options_to_user'

        await ctx.reply(ctx.t('more_options_message'), {
            reply_markup: optionsToUserKeyboard(ctx.t)
        })
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: answerFormKeyboard()
        });
    }
} 