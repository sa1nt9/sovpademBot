import { answerFormKeyboard, continueSeeFormsKeyboard, goBackKeyboard, profileKeyboard, textOrVideoKeyboard } from '../constants/keyboards';
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
        if (ctx.session.currentCandidate) {
            await saveLike(ctx, ctx.session.currentCandidate.id, true);
            await sendLikesNotification(ctx, ctx.session.currentCandidate.id);

            // Проверяем наличие отложенной взаимной симпатии
            if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeUserId) {
                await sendMutualSympathyAfterAnswer(ctx)
                return
            }
        }

        const candidate = await getCandidate(ctx)
        ctx.logger.info(candidate, 'This is new candidate')

        if (candidate) {
            await sendForm(ctx, candidate || null, { myForm: false })
        } else {
            candidatesEnded(ctx)
        }

    } else if (message === '💌/📹') {
        ctx.session.step = 'text_or_video_to_user'
        ctx.session.additionalFormInfo.awaitingLikeContent = true;

        await ctx.reply(ctx.t('text_or_video_to_user'), {
            reply_markup: textOrVideoKeyboard(ctx.t)
        })

    } else if (message === '👎') {
        if (ctx.session.currentCandidate) {
            await saveLike(ctx, ctx.session.currentCandidate.id, false);

            if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeUserId) {
                await sendMutualSympathyAfterAnswer(ctx)
                return
            }
        }


        const candidate = await getCandidate(ctx)
        ctx.logger.info(candidate, 'This is new candidate')
        if (candidate) {
            await sendForm(ctx, candidate || null, { myForm: false })
        } else {
            candidatesEnded(ctx)
        }

    } else if (message === '💤') {
        ctx.session.step = 'sleep_menu'
        await ctx.reply(ctx.t('wait_somebody_to_see_your_form'))

        if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeUserId) {
            await sendMutualSympathyAfterAnswer(ctx)
            return
        }

        await ctx.reply(ctx.t('sleep_menu'), {
            reply_markup: profileKeyboard()
        })
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: answerFormKeyboard()
        });
    }
} 