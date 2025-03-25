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
exports.stopRouletteCommand = void 0;
const postgres_1 = require("../db/postgres");
const keyboards_1 = require("../constants/keyboards");
const getReactionCounts_1 = require("../functions/getReactionCounts");
const stopRouletteCommand = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
    ctx.logger.info({
        action: 'Command stop_roulette',
        userId
    });
    try {
        // Получаем информацию о пользователе и его статусе в рулетке
        const existingUser = yield postgres_1.prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                rouletteUser: true
            }
        });
        // Если пользователь не найден или нет записи в rouletteUser
        if (!existingUser || !existingUser.rouletteUser) {
            yield ctx.reply(ctx.t('roulette_not_in_chat'), {
                reply_markup: (0, keyboards_1.rouletteStartKeyboard)(ctx.t)
            });
            return;
        }
        // Если пользователь в чате с партнером
        if (existingUser.rouletteUser.chatPartnerId) {
            const partnerUserId = existingUser.rouletteUser.chatPartnerId;
            // Обновляем статус партнера
            yield postgres_1.prisma.rouletteUser.update({
                where: { id: partnerUserId },
                data: {
                    chatPartnerId: null,
                    searchingPartner: false,
                    usernameRevealed: false,
                    profileRevealed: false
                }
            });
            yield postgres_1.prisma.rouletteChat.updateMany({
                where: {
                    OR: [
                        { user1Id: userId, user2Id: partnerUserId, endedAt: null },
                        { user1Id: partnerUserId, user2Id: userId, endedAt: null }
                    ]
                },
                data: {
                    endedAt: new Date(),
                    isProfileRevealed: existingUser.rouletteUser.profileRevealed,
                    isUsernameRevealed: existingUser.rouletteUser.usernameRevealed
                }
            });
            // Уведомляем партнеру о завершении чата
            yield ctx.api.sendMessage(partnerUserId, ctx.t('roulette_partner_left'), {
                reply_markup: (0, keyboards_1.rouletteStartKeyboard)(ctx.t)
            });
            // Получаем количество реакций для пользователя
            const userReactionCounts = yield (0, getReactionCounts_1.getReactionCounts)(userId);
            // Предлагаем партнеру оценить пользователя
            yield ctx.api.sendMessage(partnerUserId, ctx.t('roulette_put_reaction_on_your_partner'), {
                reply_markup: (0, keyboards_1.rouletteReactionKeyboard)(ctx.t, userId, userReactionCounts)
            });
            // Обновляем статус самого пользователя
            yield postgres_1.prisma.rouletteUser.update({
                where: { id: userId },
                data: {
                    chatPartnerId: null,
                    searchingPartner: false,
                    usernameRevealed: false,
                    profileRevealed: false
                }
            });
            // Сообщаем пользователю о завершении чата
            yield ctx.reply(ctx.t('roulette_chat_ended'), {
                reply_markup: (0, keyboards_1.rouletteStartKeyboard)(ctx.t)
            });
            // Предлагаем пользователю оценить партнера
            const partnerReactionCounts = yield (0, getReactionCounts_1.getReactionCounts)(partnerUserId);
            yield ctx.reply(ctx.t('roulette_put_reaction_on_your_partner'), {
                reply_markup: (0, keyboards_1.rouletteReactionKeyboard)(ctx.t, partnerUserId, partnerReactionCounts)
            });
        }
        // Если пользователь в поиске партнера
        else if (existingUser.rouletteUser.searchingPartner) {
            // Обновляем статус пользователя
            yield postgres_1.prisma.rouletteUser.update({
                where: { id: userId },
                data: {
                    searchingPartner: false
                }
            });
            // Сообщаем пользователю об остановке поиска
            yield ctx.reply(ctx.t('roulette_stop_searching_success'), {
                reply_markup: (0, keyboards_1.rouletteStartKeyboard)(ctx.t)
            });
            // Обновляем шаг сессии
            ctx.session.step = "roulette_start";
        }
        // Если пользователь не в чате и не в поиске
        else {
            yield ctx.reply(ctx.t('roulette_not_in_chat'), {
                reply_markup: (0, keyboards_1.rouletteStartKeyboard)(ctx.t)
            });
        }
    }
    catch (error) {
        ctx.logger.error({
            error,
            action: 'Error executing stop_roulette command',
            userId
        });
        yield ctx.reply(ctx.t('error_occurred'));
    }
});
exports.stopRouletteCommand = stopRouletteCommand;
