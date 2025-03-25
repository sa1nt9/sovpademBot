"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsCommand = void 0;
const keyboards_1 = require("../constants/keyboards");
const postgres_1 = require("../db/postgres");
const formatDate_1 = require("../functions/formatDate");
const getUserReactions_1 = require("../functions/getUserReactions");
const statsCommand = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
    ctx.logger.info({
        action: 'stats_command',
        userId
    });
    const existingUser = yield postgres_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (existingUser) {
        try {
            // 1. Получаем базовую информацию о пользователе
            const now = new Date();
            const createdAt = existingUser.createdAt;
            const daysInBot = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
            // 2. Получаем статистику по лайкам
            const likesGiven = yield postgres_1.prisma.userLike.count({
                where: {
                    userId: userId,
                    liked: true
                }
            });
            const likesReceived = yield postgres_1.prisma.userLike.count({
                where: {
                    targetId: userId,
                    liked: true
                }
            });
            const mutualLikes = yield postgres_1.prisma.userLike.count({
                where: {
                    userId: userId,
                    liked: true,
                    isMutual: true
                }
            });
            const dislikesGiven = yield postgres_1.prisma.userLike.count({
                where: {
                    userId: userId,
                    liked: false
                }
            });
            // 3. Получаем статистику по просмотрам анкет
            const totalFormsViewed = likesGiven + dislikesGiven;
            // 4. Получаем статистику по рулетке
            // Сначала проверим, есть ли у пользователя запись в RouletteUser
            const rouletteUser = yield postgres_1.prisma.rouletteUser.findUnique({
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
            statsMessage += ctx.t('stats_profile_created', { date: (0, formatDate_1.formatDate)(createdAt) }) + '\n\n';
            // Статистика по лайкам
            statsMessage += ctx.t('stats_likes_received', { count: likesReceived }) + '\n';
            statsMessage += ctx.t('stats_likes_given', { count: likesGiven }) + '\n';
            statsMessage += ctx.t('stats_mutual_likes', { count: mutualLikes }) + '\n';
            statsMessage += ctx.t('stats_mutual_percentage', { percentage: mutualPercentage }) + '\n\n';
            // Статистика по просмотрам
            statsMessage += ctx.t('stats_forms_viewed', { count: totalFormsViewed }) + '\n';
            statsMessage += ctx.t('stats_like_dislike_ratio', { percentage: likeDislikeRatio }) + '\n\n\n';
            // Статистика по рулетке (если есть)
            if (rouletteUser) {
                statsMessage += ctx.t('stats_roulette_title') + '\n\n';
                // Получаем статистику чатов
                const userChats = yield postgres_1.prisma.rouletteChat.findMany({
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
                        console.log(chat.endedAt.getTime(), chat.startedAt.getTime(), chat.endedAt.getTime() - chat.startedAt.getTime());
                        return sum + (chat.endedAt.getTime() - chat.startedAt.getTime());
                    }, 0);
                    console.log(totalDuration, completedChats.length);
                    avgDuration = totalDuration / completedChats.length;
                }
                statsMessage += ctx.t('stats_roulette_chats_count', { count: totalChats }) + '\n';
                if (avgDuration > 0) {
                    statsMessage += ctx.t('stats_roulette_avg_duration', {
                        duration: (0, formatDate_1.formatDuration)(avgDuration, ctx.t)
                    }) + '\n';
                }
                statsMessage += ctx.t('stats_roulette_revealed_profiles', { count: revealedProfiles }) + '\n';
                statsMessage += ctx.t('stats_roulette_revealed_usernames', { count: revealedUsernames }) + '\n\n';
                // Получаем реакции пользователя
                const reactionsText = yield (0, getUserReactions_1.getUserReactions)(ctx, userId, { me: true, showTitle: true });
                if (reactionsText) {
                    statsMessage += reactionsText;
                }
                else {
                    statsMessage += ctx.t('roulette_no_reactions');
                }
            }
            yield ctx.reply(statsMessage, {
                parse_mode: 'Markdown'
            });
            ctx.session.step = "profile";
            yield ctx.reply(ctx.t('profile_menu'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
        catch (error) {
            ctx.logger.error({
                error,
                action: 'Error getting user stats',
                userId
            });
            yield ctx.reply(ctx.t('error_occurred'));
        }
    }
    else {
        ctx.session.step = "you_dont_have_form";
        yield ctx.reply(ctx.t('you_dont_have_form'), {
            reply_markup: (0, keyboards_1.notHaveFormToDeactiveKeyboard)(ctx.t)
        });
    }
});
exports.statsCommand = statsCommand;
