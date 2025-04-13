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
exports.revealUsernameAcceptCallbackQuery = void 0;
const keyboards_1 = require("../constants/keyboards");
const postgres_1 = require("../db/postgres");
const i18n_1 = require("../i18n");
const revealUsernameAcceptCallbackQuery = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const callbackQuery = ctx.callbackQuery;
    const callbackData = callbackQuery.data;
    const currentUserId = String(callbackQuery.from.id);
    const requestingUserId = callbackData.split(":")[1];
    ctx.logger.info({
        currentUserId,
        requestingUserId,
        callbackType: 'reveal_username_accept',
        action: 'username_reveal'
    }, 'User accepted username reveal request');
    yield ctx.answerCallbackQuery({
        text: ctx.t('roulette_reveal_username_accepted'),
        show_alert: false
    });
    // Удаляем клавиатуру или изменяем на неактивную
    if (callbackQuery.message) {
        yield ctx.api.editMessageText(callbackQuery.message.chat.id, callbackQuery.message.message_id, ctx.t('roulette_reveal_username_accepted'), { reply_markup: { inline_keyboard: [] } });
    }
    // Получаем информацию о пользователях
    const currentUser = yield postgres_1.prisma.user.findUnique({
        where: { id: currentUserId },
        include: { rouletteUser: true }
    });
    const requestingUser = yield postgres_1.prisma.user.findUnique({
        where: { id: requestingUserId },
        include: { rouletteUser: true }
    });
    if (currentUser && requestingUser) {
        ctx.logger.info({
            currentUserId,
            requestingUserId,
            currentUserName: currentUser.name,
            requestingUserName: requestingUser.name,
            currentUserUsername: (_a = callbackQuery.from) === null || _a === void 0 ? void 0 : _a.username,
            requestingUserHasRouletteData: !!requestingUser.rouletteUser
        }, 'Both users found for username reveal');
        // Обновляем статус раскрытия имен пользователей для обоих пользователей
        if (currentUser.rouletteUser) {
            yield postgres_1.prisma.rouletteUser.update({
                where: { id: currentUserId },
                data: { usernameRevealed: true }
            });
            ctx.logger.debug({
                userId: currentUserId
            }, 'Updated username revealed status for current user');
        }
        if (requestingUser.rouletteUser) {
            yield postgres_1.prisma.rouletteUser.update({
                where: { id: requestingUserId },
                data: { usernameRevealed: true }
            });
            ctx.logger.debug({
                userId: requestingUserId
            }, 'Updated username revealed status for requesting user');
        }
        const userInfo = yield ctx.api.getChat(requestingUserId);
        ctx.logger.debug({
            requestingUserId,
            username: userInfo.username
        }, 'Retrieved requesting user info');
        const profileRevealed = ((_b = currentUser.rouletteUser) === null || _b === void 0 ? void 0 : _b.profileRevealed) || false;
        const usernameRevealed = true;
        ctx.logger.info({
            currentUserId,
            requestingUserId,
            requestingUserUsername: userInfo.username,
            currentUserUsername: (_c = callbackQuery.from) === null || _c === void 0 ? void 0 : _c.username,
            profileRevealed
        }, 'Usernames revealed for both users');
        yield ctx.reply(ctx.t('roulette_revealed_username') + `[${requestingUser.name}](https://t.me/${userInfo.username})`, {
            parse_mode: 'Markdown',
            reply_markup: (0, keyboards_1.rouletteKeyboard)(ctx.t, profileRevealed, usernameRevealed)
        });
        const currentSession = yield postgres_1.prisma.session.findUnique({
            where: {
                key: requestingUserId
            }
        });
        const { __language_code } = currentSession ? JSON.parse(currentSession.value) : {};
        ctx.logger.info({
            currentUserId,
            requestingUserId,
            language: __language_code || "ru"
        }, 'Sending username reveal notification to requesting user');
        yield ctx.api.sendMessage(requestingUserId, (0, i18n_1.i18n)(false).t(__language_code || "ru", 'roulette_revealed_username_by_partner') + `[${currentUser.name}](https://t.me/${(_d = callbackQuery.from) === null || _d === void 0 ? void 0 : _d.username})`, {
            parse_mode: 'Markdown',
            reply_markup: (0, keyboards_1.rouletteKeyboard)(ctx.t, profileRevealed, usernameRevealed)
        });
    }
    else {
        ctx.logger.warn({
            currentUserId,
            requestingUserId,
            currentUserFound: !!currentUser,
            requestingUserFound: !!requestingUser
        }, 'Could not find one or both users for username reveal');
    }
});
exports.revealUsernameAcceptCallbackQuery = revealUsernameAcceptCallbackQuery;
