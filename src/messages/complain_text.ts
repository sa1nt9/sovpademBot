import { answerFormKeyboard, answerLikesFormKeyboard, complainKeyboard } from '../constants/keyboards';
import { prisma } from '../db/postgres';
import { continueSeeLikesForms } from '../functions/continueSeeLikesForms';
import { getCandidate } from '../functions/db/getCandidate';
import { getOneLike } from '../functions/db/getOneLike';
import { saveLike } from '../functions/db/saveLike';
import { sendForm } from '../functions/sendForm';
import { MyContext } from '../typescript/context';

export async function complainTextStep(ctx: MyContext) {
    const message = ctx.message!.text;

    if (message === ctx.t('back')) {
        ctx.session.step = 'complain';
        ctx.session.additionalFormInfo.reportType = undefined;
        ctx.session.additionalFormInfo.reportedUserId = ''

        await ctx.reply(ctx.t('complain_text'), {
            reply_markup: complainKeyboard()
        });

        return;
    }

    try {
        if (ctx.session.additionalFormInfo.reportType && (ctx.session.currentCandidate || ctx.session.additionalFormInfo.reportedUserId)) {
            // Создаем запись о жалобе в базе данных
            await prisma.report.create({
                data: {
                    reporterId: String(ctx.from?.id),
                    targetId: ctx.session.currentCandidate?.id || ctx.session.additionalFormInfo.reportedUserId || "",
                    type: ctx.session.additionalFormInfo.reportType as any,
                    text: message === ctx.t('send_complain_without_comment') ? 'withour comment' : message
                }
            });
            if (ctx.session.currentCandidate) {
                await saveLike(ctx, ctx.session.currentCandidate?.id, false);
            }

            // Очищаем данные о жалобе в сессии
            ctx.session.additionalFormInfo.reportType = undefined;
            ctx.session.additionalFormInfo.reportedUserId = ''

            // Информируем пользователя о принятии жалобы
            await ctx.reply(ctx.t('complain_will_be_examined'));

        }
        if (ctx.session.additionalFormInfo.searchingLikes) {
            ctx.session.step = 'search_people_with_likes'

            await continueSeeLikesForms(ctx)
        } else {
            ctx.session.step = 'search_people';

            await ctx.reply("✨🔍", {
                reply_markup: answerFormKeyboard()
            });

            const candidate = await getCandidate(ctx);
            await sendForm(ctx, candidate || null, { myForm: false });
        }
    } catch (error) {
        ctx.logger.error(error, 'Error saving report');

        // В случае ошибки возвращаемся к просмотру анкет
        ctx.session.step = 'search_people';

        await ctx.reply("✨🔍", {
            reply_markup: answerFormKeyboard()
        });

        const candidate = await getCandidate(ctx);
        await sendForm(ctx, candidate || null, { myForm: false });
    }
} 