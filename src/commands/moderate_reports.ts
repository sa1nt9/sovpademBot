import { MyContext } from "../typescript/context";
import { prisma } from "../db/postgres";
import { mainMenuKeyboard, moderateReportReplyKeyboard } from "../constants/keyboards";
import { getNextReport } from "../functions/reports/reportUtils";
import { sendForm } from "../functions/sendForm";

export const moderateReportsCommand = async (ctx: MyContext): Promise<void> => {
    const userId = String(ctx.message?.from.id);
    
    // Проверка является ли пользователь администратором
    const adminIds = process.env.ADMIN_IDS?.split(',') || [];
    if (!adminIds.includes(userId)) {
        ctx.logger.warn({ userId }, 'Unauthorized access attempt to moderate_reports command');
        await ctx.reply(ctx.t('access_denied'));
        return;
    }

    ctx.logger.info({ userId }, 'Admin requested reports moderation');
    ctx.session.step = "moderating_reports";
    
    // Получаем следующую жалобу
    const report = await getNextReport();

    if (!report) {
        await ctx.reply(ctx.t('no_reports_to_moderate'), {
            reply_markup: mainMenuKeyboard(ctx.t)
        });
        return;
    }

    // Сохраняем ID текущей жалобы в сессии
    ctx.session.currentReportId = report.id;

    // Получаем информацию о пользователе, на которого жалуются
    const target = await prisma.user.findUnique({
        where: { id: report.targetId }
    });

    if (!target) {
        ctx.logger.warn({ reportId: report.id, targetId: report.targetId }, 'Target user not found');
        await ctx.reply(ctx.t('user_not_found'));
        
        // Отмечаем жалобу как обработанную и переходим к следующей
        await prisma.report.update({
            where: { id: report.id },
            data: { isActive: false }
        });
        
        // Рекурсивно вызываем команду для следующей жалобы
        return moderateReportsCommand(ctx);
    }

    // Получаем информацию о заявителе
    const reporter = await prisma.user.findUnique({
        where: { id: report.reporterId }
    });

    // Проверяем, есть ли действующий бан у пользователя
    const activeBan = await prisma.userBan.findFirst({
        where: {
            userId: target.id,
            isActive: true,
            bannedUntil: { gt: new Date() }
        },
        orderBy: { bannedUntil: 'desc' }
    });

    // Информация о жалобе
    const reportInfo = `
${ctx.t('report_info')}:
${ctx.t('report_id')}: ${report.id}
${ctx.t('report_type')}: ${report.type}
${ctx.t('report_date')}: ${report.createdAt.toLocaleString()}
${ctx.t('reporter_id')}: ${reporter?.id}
${report.text ? `${ctx.t('additional_text')}: ${report.text}` : ''}
${activeBan ? `\n${ctx.t('user_has_active_ban_until')}: ${activeBan.bannedUntil.toLocaleString()}` : ''}`;

    // Отправляем сообщение с анкетой пользователя
    await sendForm(ctx, target, { myForm: false });
    
    // Отправляем информацию о жалобе и клавиатуру для модерации
    await ctx.reply(reportInfo, {
        reply_markup: moderateReportReplyKeyboard(ctx.t)
    });
}; 