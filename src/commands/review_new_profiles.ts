import { MyContext } from "../typescript/context";
import { prisma } from "../db/postgres";
import { mainMenuKeyboard, reviewProfileReplyKeyboard } from "../constants/keyboards";
import { sendForm } from "../functions/sendForm";
import { getNextNewProfile } from "../functions/profiles/profileUtils";

export const reviewNewProfilesCommand = async (ctx: MyContext): Promise<void> => {
    const userId = String(ctx.from?.id);
    
    // Проверка является ли пользователь администратором
    const adminIds = process.env.ADMIN_IDS?.split(',') || [];
    if (!adminIds.includes(userId)) {
        ctx.logger.warn({ userId }, 'Unauthorized access attempt to review_new_profiles command');
        await ctx.reply(ctx.t('access_denied'));
        return;
    }

    ctx.logger.info({ userId }, 'Admin requested new profiles review');
    ctx.session.step = "reviewing_new_profiles";
    
    // Получаем следующую новую анкету
    const newProfile = await getNextNewProfile();

    if (!newProfile) {
        await ctx.reply(ctx.t('no_new_profiles_to_review'), {
            reply_markup: mainMenuKeyboard(ctx.t)
        });
        return;
    }

    // Сохраняем ID текущей анкеты в сессии
    ctx.session.currentReviewProfileId = newProfile.id;
    ctx.session.currentReviewProfileType = newProfile.profileType;

    // Получаем информацию о пользователе, который создал анкету
    const user = await prisma.user.findUnique({
        where: { id: newProfile.userId }
    });

    if (!user) {
        ctx.logger.warn({ profileId: newProfile.id, userId: newProfile.userId }, 'User not found');
        await ctx.reply(ctx.t('user_not_found'));
        
        // Рекурсивно вызываем команду для следующей анкеты
        return reviewNewProfilesCommand(ctx);
    }

    // Информация о анкете
    const profileInfo = `
${ctx.t('profile_info')}:
${ctx.t('profile_id')}: ${newProfile.id}
${ctx.t('profile_type')}: ${newProfile.profileType}
${ctx.t('created_date')}: ${newProfile.createdAt.toLocaleString()}
${ctx.t('profile_status')}: ${newProfile.isActive ? ctx.t('active') : ctx.t('inactive')}
`;

    // Отправляем сообщение с анкетой пользователя
    await sendForm(ctx, user, { myForm: false, specificProfileId: newProfile.id, profileType: newProfile.profileType });
    
    // Отправляем информацию о анкете и клавиатуру для проверки
    await ctx.reply(profileInfo, {
        reply_markup: reviewProfileReplyKeyboard(ctx.t)
    });
}; 