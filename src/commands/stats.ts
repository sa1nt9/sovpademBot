import { notHaveFormToDeactiveKeyboard, profileKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { MyContext } from "../typescript/context";
import { formatDate, formatDuration } from "../functions/formatDate";
import { getUserReactions } from "../functions/getUserReactions";

export const statsCommand = async (ctx: MyContext) => {
    const userId = String(ctx.message?.from.id);

    ctx.logger.info({
        action: 'stats_command',
        userId
    });

    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (existingUser) {
        try {
            // 1. Получаем базовую информацию о пользователе
            const now = new Date();
            const createdAt = existingUser.createdAt;
            const daysInBot = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
            
            // 2. Получаем статистику по лайкам
            const likesGiven = await prisma.userLike.count({
                where: {
                    userId: userId,
                    liked: true
                }
            });
            
            const likesReceived = await prisma.userLike.count({
                where: {
                    targetId: userId,
                    liked: true
                }
            });
            
            const mutualLikes = await prisma.userLike.count({
                where: {
                    userId: userId,
                    liked: true,
                    isMutual: true
                }
            });
            
            const dislikesGiven = await prisma.userLike.count({
                where: {
                    userId: userId,
                    liked: false
                }
            });

            const blacklistCount = await prisma.blacklist.count({
                where: {
                    userId: userId,
                }
            });
            
            // 3. Получаем статистику по просмотрам анкет
            const totalFormsViewed = likesGiven + dislikesGiven;
            
            // 4. Получаем статистику по рулетке
            // Сначала проверим, есть ли у пользователя запись в RouletteUser
            const rouletteUser = await prisma.rouletteUser.findUnique({
                where: {
                    id: userId
                }
            });
            
            // 5. Рассчитываем проценты и соотношения
            const mutualPercentage = likesGiven > 0 
                ? Math.round((mutualLikes / likesGiven) * 100) 
                : 0;
                
            const likeDislikeRatio = totalFormsViewed > 0 
                ? Math.round((likesGiven / totalFormsViewed) * 100) 
                : 0;
            
            // 6. Форматируем статистику и отправляем пользователю
            let statsMessage = ctx.t('stats_title') + '\n\n';
            
            // Базовая информация
            statsMessage += ctx.t('stats_days_in_bot', { days: daysInBot }) + '\n';
            statsMessage += ctx.t('stats_profile_created', { date: formatDate(createdAt) }) + '\n\n';
            
            // Статистика по лайкам
            statsMessage += ctx.t('stats_likes_received', { count: likesReceived }) + '\n';
            statsMessage += ctx.t('stats_likes_given', { count: likesGiven }) + '\n';
            statsMessage += ctx.t('stats_mutual_likes', { count: mutualLikes }) + '\n';
            statsMessage += ctx.t('stats_mutual_percentage', { percentage: mutualPercentage }) + '\n\n';
            
            // Статистика по просмотрам
            statsMessage += ctx.t('stats_forms_viewed', { count: totalFormsViewed }) + '\n';
            statsMessage += ctx.t('stats_like_dislike_ratio', { percentage: likeDislikeRatio }) + '\n';
            statsMessage += ctx.t('stats_users_in_blacklist', { count: blacklistCount }) + '\n\n\n';
            
            // Статистика по рулетке (если есть)
            if (rouletteUser) {
                statsMessage += ctx.t('stats_roulette_title') + '\n\n';
                
                // Получаем статистику чатов
                const userChats = await prisma.rouletteChat.findMany({
                    where: {
                        OR: [
                            { user1Id: userId },
                            { user2Id: userId }
                        ]
                    }
                });

                const totalChats = userChats.length;
                const revealedProfiles = userChats.filter(chat => chat.isProfileRevealed).length;
                const revealedUsernames = userChats.filter(chat => chat.isUsernameRevealed).length;

                // Считаем среднюю длительность завершенных чатов
                const completedChats = userChats.filter(chat => chat.endedAt);
                let avgDuration = 0;
                
                if (completedChats.length > 0) {
                    const totalDuration = completedChats.reduce((sum, chat) => {
                        console.log(chat.endedAt!.getTime(), chat.startedAt.getTime(), chat.endedAt!.getTime() - chat.startedAt.getTime())
                        return sum + (chat.endedAt!.getTime() - chat.startedAt.getTime());
                    }, 0);
                    console.log(totalDuration, completedChats.length)
                    avgDuration = totalDuration / completedChats.length;
                }

                statsMessage += ctx.t('stats_roulette_chats_count', { count: totalChats }) + '\n';
                
                if (avgDuration > 0) {
                    statsMessage += ctx.t('stats_roulette_avg_duration', { 
                        duration: formatDuration(avgDuration, ctx.t) 
                    }) + '\n';
                }

                statsMessage += ctx.t('stats_roulette_revealed_profiles', { count: revealedProfiles }) + '\n';
                statsMessage += ctx.t('stats_roulette_revealed_usernames', { count: revealedUsernames }) + '\n\n';
                
                // Получаем реакции пользователя
                const reactionsText = await getUserReactions(ctx, userId, { me: true, showTitle: true });
                
                if (reactionsText) {
                    statsMessage += reactionsText;
                } else {
                    statsMessage += ctx.t('roulette_no_reactions');
                }
            }
            
            await ctx.reply(statsMessage, {
                parse_mode: 'Markdown'
            });

            ctx.session.step = "profile";

            await ctx.reply(ctx.t('profile_menu'), {
                reply_markup: profileKeyboard()
            });
            
        } catch (error) {
            ctx.logger.error({
                error,
                action: 'Error getting user stats',
                userId
            });
            
            await ctx.reply(ctx.t('error_occurred'));
        }
    } else {
        ctx.session.step = "you_dont_have_form";

        await ctx.reply(ctx.t('you_dont_have_form'), {
            reply_markup: notHaveFormToDeactiveKeyboard(ctx.t)
        });
    }
}