import { complainTypes } from '../constants/complain';
import { answerFormKeyboard, answerLikesFormKeyboard, complainKeyboard, continueSeeFormsKeyboard, goBackKeyboard, sendComplainWithoutCommentKeyboard } from '../constants/keyboards';
import { continueSeeLikesForms } from '../functions/continueSeeLikesForms';
import { candidatesEnded } from '../functions/candidatesEnded';
import { getCandidate } from '../functions/db/getCandidate';
import { sendForm } from '../functions/sendForm';
import { sendMutualSympathyAfterAnswer } from '../functions/sendMutualSympathyAfterAnswer';
import { MyContext } from '../typescript/context';
import { startSearchingPeople } from '../functions/startSearchingPeople';

export async function complainStep(ctx: MyContext) {
    const message = ctx.message!.text || '';
    const userId = String(ctx.from?.id);
    const reportedUserId = ctx.session.additionalFormInfo.reportedUserId;
    
    ctx.logger.info({ userId, reportedUserId }, 'User in complaint menu');

    // Обработка жалоб разных типов
    if (message && message in complainTypes) {
        const reportType = complainTypes[message];
        ctx.logger.info({ userId, reportedUserId, reportType }, 'User selected complaint type');
        
        ctx.session.additionalFormInfo.reportType = reportType;
        ctx.session.step = 'complain_text';

        await ctx.reply(ctx.t('write_complain_comment'), {
            reply_markup: sendComplainWithoutCommentKeyboard(ctx.t)
        });
        return;
    }

    // Обработка отмены жалобы
    if (message === '✖️') {
        ctx.logger.info({ userId, reportedUserId }, 'User cancelled complaint');
        
        ctx.session.additionalFormInfo.reportedUserId = ''
        if (ctx.session.additionalFormInfo.searchingLikes) {
            ctx.logger.info({ userId }, 'Redirecting user to likes search after complaint cancellation');
            ctx.session.step = 'search_people_with_likes'

            await continueSeeLikesForms(ctx)

        } else {
            if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
                ctx.logger.info({ 
                    userId, 
                    pendingMutualLikeProfileId: ctx.session.pendingMutualLikeProfileId 
                }, 'Processing mutual sympathy after complaint cancellation');
                
                await sendMutualSympathyAfterAnswer(ctx)
                return
            }

            ctx.logger.info({ userId }, 'Redirecting user to people search after complaint cancellation');
            await startSearchingPeople(ctx, { setActive: true })

            const candidate = await getCandidate(ctx);
            ctx.logger.debug({ userId, candidateId: candidate?.id }, 'Received new candidate after complaint cancellation');

            if (candidate) {
                await sendForm(ctx, candidate || null, { myForm: false });
            } else {
                ctx.logger.info({ userId }, 'No more candidates available after complaint cancellation');
                await candidatesEnded(ctx)
            }
        }
    } else {
        ctx.logger.warn({ userId, message, reportedUserId }, 'User sent unexpected message in complaint menu');
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: complainKeyboard()
        });
    }
} 