import { MyContext } from "../typescript/context";
import { prisma } from "../db/postgres";
import { reviewProfileReplyKeyboard, mainMenuKeyboard, profileKeyboard, waitingForBanReasonKeyboard } from "../constants/keyboards";
import { reviewNewProfilesCommand } from "../commands/review_new_profiles";
import { markProfileAsReviewed } from "../functions/profiles/profileUtils";
import { sendForm } from "../functions/sendForm";

export const reviewingNewProfilesStep = async (ctx: MyContext) => {
    const userId = String(ctx.from?.id);
    const messageText = ctx.message?.text;

    if (messageText === ctx.t('main_menu')) {
        ctx.logger.info({ userId }, 'User returning to main menu from reviewing profiles');
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
        ctx.logger.warn({ userId }, 'Unauthorized access to reviewing_new_profiles step');
        await ctx.reply(ctx.t('no_such_answer'));
        return;
    }

    if (!ctx.session.currentReviewProfileId || !ctx.session.currentReviewProfileType) {
        ctx.logger.warn({ userId }, 'No current review profile ID in session');
        await ctx.reply(ctx.t('no_new_profiles_to_review'));
        return;
    }

    const profile = await (prisma as any)[`${ctx.session.currentReviewProfileType.toLowerCase()}Profile`].findUnique({
        where: { id: ctx.session.currentReviewProfileId }
    });

    if (!profile) {
        ctx.logger.warn({ userId, profileId: ctx.session.currentReviewProfileId }, 'User not found');
        await ctx.reply(ctx.t('user_not_found'));
        
        // Переходим к поиску следующей анкеты
        await reviewNewProfilesCommand(ctx);
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
    } else if (messageText === ctx.t('skip_profile')) {
        // Просто отмечаем профиль как проверенный без деактивации
        if (ctx.session.currentReviewProfileType) {
            await markProfileAsReviewed(ctx.session.currentReviewProfileId, ctx.session.currentReviewProfileType);
            await ctx.reply(ctx.t('profile_skipped'));
            await reviewNewProfilesCommand(ctx);
        } else {
            await ctx.reply(ctx.t('profile_type_not_found'));
            await reviewNewProfilesCommand(ctx);
        }
    } else {
        // Неизвестное действие
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: reviewProfileReplyKeyboard(ctx.t)
        });
    }
};

// Функция для запроса причины бана
async function requestBanReason(ctx: MyContext, action: string) {
    ctx.session.banAction = action;
    ctx.session.step = "waiting_for_ban_reason_profile";
    
    await ctx.reply(ctx.t('write_ban_reason'), {
        reply_markup: waitingForBanReasonKeyboard(ctx.t)
    });
}
