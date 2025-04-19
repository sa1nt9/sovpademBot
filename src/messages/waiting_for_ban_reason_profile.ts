import { moderateReportsCommand } from "../commands/moderate_reports";
import { reviewNewProfilesCommand } from "../commands/review_new_profiles";
import { prisma } from "../db/postgres";
import { banUserAndResolveReport } from "../functions/reports/reportUtils";
import { MyContext } from "../typescript/context";

export const waitingForBanReasonProfileStep = async (ctx: MyContext) => {
    const messageText = ctx.message?.text;

    if (messageText === ctx.t('go_back')) {
        await reviewNewProfilesCommand(ctx);
        return;
    } 

    const profile = await (prisma as any)[`${ctx.session.currentReviewProfileType}Profile`].findUnique({
        where: { id: ctx.session.currentReviewProfileId }
    });

    if (!profile) {
        await ctx.reply(ctx.t('user_not_found'));
        return;
    }

    const reason = messageText === ctx.t('skip') ? '' : (messageText || '');

    await banUserAndResolveReport(profile.userId, '', ctx.session.banAction || '', reason);
    await ctx.reply(ctx.t('user_banned_successfully'));

    // Сбрасываем флаги ожидания
    ctx.session.banAction = null;

    // Переходим к следующей жалобе
    await reviewNewProfilesCommand(ctx);
}

