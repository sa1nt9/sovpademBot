import { answerFormKeyboard, continueSeeFormsKeyboard, goBackKeyboard, profileKeyboard, textOrVideoKeyboard, optionsToUserKeyboard } from '../constants/keyboards';
import { getCandidate } from '../functions/db/getCandidate';
import { saveLike } from '../functions/db/saveLike';
import { sendForm } from '../functions/sendForm';
import { sendLikesNotification } from '../functions/sendLikesNotification';
import { MyContext } from '../typescript/context';
import { sendMutualSympathyAfterAnswer } from '../functions/sendMutualSympathyAfterAnswer';
import { candidatesEnded } from '../functions/candidatesEnded';

export async function searchPeopleStep(ctx: MyContext) {
    const userId = String(ctx.from?.id);
    
    try {
        const message = ctx.message!.text;
        ctx.logger.info({ userId, action: message }, 'Search people action');

        if (message === '❤️') {
            if (ctx.session.currentCandidateProfile) {
                const candidateId = ctx.session.currentCandidateProfile.id;
                ctx.logger.info({ userId, candidateId }, 'User liked profile');
                
                await saveLike(ctx, candidateId, true);
                await sendLikesNotification(ctx, ctx.session.currentCandidateProfile.userId, candidateId, ctx.session.activeProfile.id, ctx.session.currentCandidateProfile.profileType, ctx.session.currentCandidateProfile.profileType !== "RELATIONSHIP" ?  ctx.session.currentCandidateProfile.subType : "");

                // Проверяем наличие отложенной взаимной симпатии
                if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
                    await sendMutualSympathyAfterAnswer(ctx)
                    return
                }
            }

            const candidate = await getCandidate(ctx)

            if (candidate) {
                await sendForm(ctx, candidate || null, { myForm: false })
            } else {
                ctx.logger.info({ userId }, 'No more candidates');
                await candidatesEnded(ctx)
            }

        } else if (message === '💌/📹') {
            ctx.logger.info({ userId, candidateId: ctx.session.currentCandidateProfile?.id }, 'User sending message');
            ctx.session.step = 'text_or_video_to_user'

            await ctx.reply(ctx.t('text_or_video_to_user'), {
                reply_markup: textOrVideoKeyboard(ctx.t)
            })

        } else if (message === '👎') {
            if (ctx.session.currentCandidateProfile) {
                const candidateId = ctx.session.currentCandidateProfile.id;
                ctx.logger.info({ userId, candidateId }, 'User disliked profile');
                
                await saveLike(ctx, candidateId, false);

                if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
                    await sendMutualSympathyAfterAnswer(ctx)
                    return
                }
            }

            const candidate = await getCandidate(ctx)
            if (candidate) {
                await sendForm(ctx, candidate || null, { myForm: false })
            } else {
                ctx.logger.info({ userId }, 'No more candidates');
                await candidatesEnded(ctx)
            }

        } else if (message === '📋') {
            ctx.logger.info({ userId }, 'User selected more options');
            ctx.session.step = 'options_to_user'

            await ctx.reply(ctx.t('more_options_message'), {
                reply_markup: optionsToUserKeyboard(ctx.t)
            })
        } else {
            ctx.logger.warn({ userId, message }, 'Unknown search action');
            await ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: answerFormKeyboard()
            });
        }
    } catch (error) {
        ctx.logger.error({ error, userId }, 'Error in people search');
    }
} 