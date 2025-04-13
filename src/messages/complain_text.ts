import { answerFormKeyboard, answerLikesFormKeyboard, complainKeyboard } from '../constants/keyboards';
import { prisma } from '../db/postgres';
import { continueSeeLikesForms } from '../functions/continueSeeLikesForms';
import { candidatesEnded } from '../functions/candidatesEnded';
import { getCandidate } from '../functions/db/getCandidate';
import { saveLike } from '../functions/db/saveLike';
import { sendForm } from '../functions/sendForm';
import { MyContext } from '../typescript/context';
import { startSearchingPeople } from '../functions/startSearchingPeople';

export async function complainTextStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const userId = String(ctx.from?.id);
    const reportedUserId = ctx.session.currentCandidateProfile?.userId || ctx.session.additionalFormInfo.reportedUserId;
    const reportType = ctx.session.additionalFormInfo.reportType;
    
    ctx.logger.info({ userId, reportType }, 'User writing complaint text');

    if (message === ctx.t('back')) {
        ctx.logger.info({ userId }, 'User returned from complaint text');
        ctx.session.step = 'complain';
        ctx.session.additionalFormInfo.reportType = undefined;
        ctx.session.additionalFormInfo.reportedUserId = ''

        await ctx.reply(ctx.t('complain_text'), {
            reply_markup: complainKeyboard()
        });

        return;
    }

    try {
        if (reportType && (ctx.session.currentCandidateProfile || ctx.session.additionalFormInfo.reportedUserId)) {
            ctx.logger.info({ 
                userId, 
                reportedUserId,
                reportType,
                withoutComment: message === ctx.t('send_complain_without_comment')
            }, 'Saving complaint');
            
            // Создаем запись о жалобе в базе данных
            await prisma.report.create({
                data: {
                    reporterId: userId,
                    targetId: reportedUserId || "",
                    type: reportType as any,
                    text: message === ctx.t('send_complain_without_comment') ? 'without comment' : message
                }
            });
            
            if (ctx.session.currentCandidateProfile) {
                await saveLike(ctx, ctx.session.currentCandidateProfile?.id, false);
            }

            // Очищаем данные о жалобе в сессии
            ctx.session.additionalFormInfo.reportType = undefined;
            ctx.session.additionalFormInfo.reportedUserId = ''

            // Информируем пользователя о принятии жалобы
            await ctx.reply(ctx.t('complain_will_be_examined'));
        }

        if (ctx.session.additionalFormInfo.searchingLikes) {
            ctx.logger.info({ userId }, 'Redirecting to likes search after complaint');
            ctx.session.step = 'search_people_with_likes'

            await continueSeeLikesForms(ctx)
        } else {
            ctx.logger.info({ userId }, 'Redirecting to people search after complaint');
            await startSearchingPeople(ctx, { setActive: true }) 

            const candidate = await getCandidate(ctx);

            if (candidate) {
                await sendForm(ctx, candidate || null, { myForm: false });
            } else {
                await candidatesEnded(ctx)
            }
        }
    } catch (error) {
        ctx.logger.error({ error, userId, reportedUserId }, 'Error saving complaint');

        // В случае ошибки возвращаемся к просмотру анкет
        await startSearchingPeople(ctx, { setActive: true })

        const candidate = await getCandidate(ctx);
        
        if (candidate) {
            await sendForm(ctx, candidate || null, { myForm: false });
        } else {
            await candidatesEnded(ctx)
        }
    }
} 