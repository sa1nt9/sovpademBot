import { MyContext } from "../typescript/context";
import { prisma } from "../db/postgres";
import { moderateReportReplyKeyboard, mainMenuKeyboard, profileKeyboard, waitingForBanReasonKeyboard } from "../constants/keyboards";
import { moderateReportsCommand } from "../commands/moderate_reports";
import { banUserAndResolveReport } from "../functions/reports/reportUtils";
import { sendForm } from "../functions/sendForm";

export const moderatingReportsStep = async (ctx: MyContext) => {
    const userId = String(ctx.from?.id);
    const messageText = ctx.message?.text;

    if (messageText === ctx.t('main_menu')) {
        ctx.logger.info({ userId }, 'User returning to main menu from moderating reports');
        ctx.session.step = "profile";

        await sendForm(ctx)

        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
        return;
    }
    
    // Проверка является ли пользователь администратором
    const adminIds = process.env.ADMIN_IDS?.split(',') || [];
    if (!adminIds.includes(userId)) {
        ctx.logger.warn({ userId }, 'Unauthorized access to moderating_reports step');
        await ctx.reply(ctx.t('no_such_answer'));
        return;
    }

    if (!ctx.session.currentReportId) {
        ctx.logger.warn({ userId }, 'No current report ID in session');
        await ctx.reply(ctx.t('no_reports_to_moderate'));
        return;
    }

    // Получаем текущую жалобу
    const report = await prisma.report.findUnique({
        where: { id: ctx.session.currentReportId }
    });

    if (!report || !report.isActive) {
        ctx.logger.warn({ userId, reportId: ctx.session.currentReportId }, 'Report not found or inactive');
        await ctx.reply(ctx.t('report_not_found'));
        
        // Переходим к поиску следующей жалобы
        await moderateReportsCommand(ctx);
        return;
    }


    // Обрабатываем действие в зависимости от выбранной опции
    if (messageText === ctx.t('ban_1_day')) {
        await requestBanReason(ctx, '1day');
    } else if (messageText === ctx.t('ban_1_week')) {
        await requestBanReason(ctx, '1week');
    } else if (messageText === ctx.t('ban_1_month')) {
        await requestBanReason(ctx, '1month');
    } else if (messageText === ctx.t('ban_1_year')) {
        await requestBanReason(ctx, '1year');
    } else if (messageText === ctx.t('ban_permanent')) {
        await requestBanReason(ctx, 'permanent');
    } else if (messageText === ctx.t('disable_report')) {
        await processReportAction(ctx, report.id, report.targetId, 'disable');
    } else if (messageText === ctx.t('delete_report')) {
        await processReportAction(ctx, report.id, report.targetId, 'delete');
    } else {
        // Неизвестное действие
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: moderateReportReplyKeyboard(ctx.t)
        });
    }
};

// Функция для запроса причины бана
async function requestBanReason(ctx: MyContext, action: string) {
    ctx.session.banAction = action;
    ctx.session.step = "waiting_for_ban_reason_report";
    
    await ctx.reply(ctx.t('write_ban_reason'), {
        reply_markup: waitingForBanReasonKeyboard(ctx.t)
    });
}

// Функция для обработки действия с жалобой
async function processReportAction(ctx: MyContext, reportId: string, targetUserId: string, action: string) {
    try {
        // Выполняем действие
        if (action === 'disable') {
            // Отключаем жалобу (устанавливаем isActive = false)
            await prisma.report.update({
                where: { id: reportId },
                data: { isActive: false }
            });
            await ctx.reply(ctx.t('report_disabled'));
        } else if (action === 'delete') {
            // Полностью удаляем жалобу из базы данных
            await prisma.report.delete({
                where: { id: reportId }
            });
            await ctx.reply(ctx.t('report_deleted'));
        } else {
            // Баним пользователя
            await banUserAndResolveReport(targetUserId, reportId, action);
            await ctx.reply(ctx.t('user_banned_successfully'));
        }

        // Запускаем команду для получения следующей жалобы
        await moderateReportsCommand(ctx);
    } catch (error) {
        ctx.logger.error({ error, reportId, targetUserId, action }, 'Error processing report action');
        await ctx.reply(ctx.t('error_occurred'));
    }
} 