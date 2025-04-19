import { moderateReportsCommand } from "../commands/moderate_reports";
import { prisma } from "../db/postgres";
import { banUserAndResolveReport } from "../functions/reports/reportUtils";
import { MyContext } from "../typescript/context";

export const waitingForBanReasonReportStep = async (ctx: MyContext) => {
    const messageText = ctx.message?.text;

    if (messageText === ctx.t('go_back')) {
        await moderateReportsCommand(ctx);
        return;
    } 


    const report = await prisma.report.findUnique({
        where: { id: ctx.session.currentReportId }
    });

    if (!report) {
        await ctx.reply(ctx.t('no_such_answer'));
        return;
    }

    const reason = messageText === ctx.t('skip') ? '' : (messageText || '');

    // Баним пользователя с указанной причиной
    await banUserAndResolveReport(report.targetId, report.id, ctx.session.banAction || '', reason);
    await ctx.reply(ctx.t('user_banned_successfully'));

    // Сбрасываем флаги ожидания
    ctx.session.banAction = null;

    // Переходим к следующей жалобе
    await moderateReportsCommand(ctx);
}

