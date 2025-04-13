import { MyContext } from "../typescript/context";
import { prisma } from "../db/postgres";
import { ReportType } from "@prisma/client";
import { logger } from "../logger";

export const complainReasonCallbackQuery = async (ctx: MyContext) => {
    logger.info({ userId: ctx.from?.id, reason: ctx.callbackQuery?.data }, 'User selected complaint reason');
    
    const callbackQuery = ctx.callbackQuery!;
    const callbackData = callbackQuery.data!;
    const callbackParts = callbackData.split(":");
    const reasonId = callbackParts[1];
    const targetUserId = callbackParts[2];
    const fromUserId = String(ctx.callbackQuery?.from.id);

    // Маппинг ID причины на типы отчетов из Prisma
    const reasonToReportType: Record<string, ReportType> = {
        "1": "adult_content",
        "2": "sale",
        "3": "fake",
        "4": "advertising",
        "5": "scam",
        "6": "dislike",
        "7": "other"
    };

    const reportType = reasonToReportType[reasonId];

    try {
        // Проверяем, не отправлял ли пользователь уже жалобу
        const existingComplaint = await prisma.report.findFirst({
            where: {
                reporterId: fromUserId,
                targetId: targetUserId
            }
        });

        if (existingComplaint) {
            await ctx.answerCallbackQuery({
                text: ctx.t('you_already_sent_complain_to_this_user'),
                show_alert: true
            });
            return;
        }

        // Создаем жалобу в базе данных
        await prisma.report.create({
            data: {
                reporterId: fromUserId,
                targetId: targetUserId,
                type: reportType,
                text: ""  // Без комментария
            }
        });

        // Отображаем сообщение, что жалоба принята
        if (ctx.callbackQuery?.message) {
            await ctx.api.editMessageText(
                ctx.callbackQuery.message.chat.id,
                ctx.callbackQuery.message.message_id,
                ctx.t('complain_will_be_examined'),
                { reply_markup: { inline_keyboard: [] } }
            );
        }

        await ctx.answerCallbackQuery({
            text: ctx.t('complain_will_be_examined'),
            show_alert: false
        });
    } catch (error) {
        ctx.logger.error({
            error,
            action: 'Error handling complaint reason',
            fromUserId,
            targetUserId,
            reasonId
        });

        await ctx.answerCallbackQuery({
            text: ctx.t('error_occurred'),
            show_alert: true
        });
    }
} 