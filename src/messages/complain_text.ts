import { answerFormKeyboard, answerLikesFormKeyboard, complainKeyboard } from '../constants/keyboards';
import { prisma } from '../db/postgres';
import { getCandidate } from '../functions/db/getCandidate';
import { getOneLike } from '../functions/db/getOneLike';
import { saveLike } from '../functions/db/saveLike';
import { sendForm } from '../functions/sendForm';
import { MyContext } from '../typescript/context';

export async function complainTextStep(ctx: MyContext) {
    const message = ctx.message!.text;

    if (message === ctx.t('back')) {
        // Возврат к выбору типа жалобы
        ctx.session.step = 'complain';
        ctx.session.additionalFormInfo.reportType = undefined;

        await ctx.reply(ctx.t('complain_text'), {
            reply_markup: complainKeyboard()
        });

        return;
    }

    try {
        if (ctx.session.additionalFormInfo.reportType && ctx.session.currentCandidate) {
            // Создаем запись о жалобе в базе данных
            await prisma.report.create({
                data: {
                    reporterId: String(ctx.from?.id),
                    targetId: ctx.session.currentCandidate?.id,
                    type: ctx.session.additionalFormInfo.reportType as any,
                    text: message || undefined
                }
            });
            await saveLike(ctx, ctx.session.currentCandidate.id, false);

            // Очищаем данные о жалобе в сессии
            ctx.session.additionalFormInfo.reportType = undefined;

            // Информируем пользователя о принятии жалобы
            await ctx.reply(ctx.t('complain_will_be_examined'));

        }
        if (ctx.session.additionalFormInfo.searchingLikes) {
            ctx.session.step = 'search_people_with_likes'

            const oneLike = await getOneLike(String(ctx.from!.id));


            await ctx.reply("✨🔍", {
                reply_markup: answerLikesFormKeyboard()
            });

            if (oneLike?.user) {
                ctx.session.currentCandidate = oneLike?.user
                await sendForm(ctx, oneLike.user, { myForm: false, like: oneLike });
            }
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