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
exports.revealAcceptCallbackQuery = void 0;
const keyboards_1 = require("../constants/keyboards");
const postgres_1 = require("../db/postgres");
const sendForm_1 = require("../functions/sendForm");
const i18n_1 = require("../i18n");
const revealAcceptCallbackQuery = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const callbackQuery = ctx.callbackQuery;
    const callbackData = callbackQuery.data;
    const currentUserId = String(callbackQuery.from.id);
    const requestingUserId = callbackData.split(":")[1];
    ctx.logger.info({
        currentUserId,
        requestingUserId,
        callbackType: 'reveal_accept',
        action: 'profile_reveal'
    }, 'User accepted profile reveal request');
    yield ctx.answerCallbackQuery({
        text: ctx.t('roulette_reveal_accepted'),
        show_alert: false
    });
    // Изменяем текст и удаляем клавиатуру
    if (callbackQuery.message) {
        yield ctx.api.editMessageText(callbackQuery.message.chat.id, callbackQuery.message.message_id, ctx.t('roulette_reveal_accepted'), { reply_markup: { inline_keyboard: [] } });
    }
    // Получаем информацию о пользователях
    const currentUser = yield postgres_1.prisma.user.findUnique({
        where: { id: currentUserId },
        include: { rouletteUser: true }
    });
    const requestingUser = yield postgres_1.prisma.user.findUnique({
        where: { id: requestingUserId }
    });
    if (currentUser && requestingUser) {
        ctx.logger.info({
            currentUserId,
            requestingUserId,
            currentUserName: currentUser.name,
            requestingUserName: requestingUser.name
        }, 'Both users found for profile reveal');
        // Обновляем статус раскрытия профилей для обоих пользователей
        if (currentUser.rouletteUser) {
            yield postgres_1.prisma.rouletteUser.update({
                where: { id: currentUserId },
                data: { profileRevealed: true }
            });
            ctx.logger.debug({
                userId: currentUserId,
                rouletteUserId: currentUser.rouletteUser.id
            }, 'Updated profile revealed status for current user');
        }
        yield postgres_1.prisma.rouletteUser.update({
            where: { id: requestingUserId },
            data: { profileRevealed: true }
        });
        ctx.logger.debug({
            userId: requestingUserId
        }, 'Updated profile revealed status for requesting user');
        const profileRevealed = true;
        const usernameRevealed = ((_a = currentUser.rouletteUser) === null || _a === void 0 ? void 0 : _a.usernameRevealed) || false;
        yield ctx.reply(ctx.t('roulette_revealed'), {
            reply_markup: (0, keyboards_1.rouletteKeyboard)(ctx.t, profileRevealed, usernameRevealed)
        });
        yield (0, sendForm_1.sendForm)(ctx, requestingUser, { myForm: false });
        const currentSession = yield postgres_1.prisma.session.findUnique({
            where: {
                key: requestingUserId
            }
        });
        const { __language_code } = currentSession ? JSON.parse(currentSession.value) : {};
        ctx.logger.info({
            currentUserId,
            requestingUserId,
            profileRevealed,
            usernameRevealed,
            language: __language_code || "ru"
        }, 'Sending mutual profile reveal notifications');
        yield ctx.api.sendMessage(requestingUserId, (0, i18n_1.i18n)(false).t(__language_code || "ru", 'roulette_your_profile_revealed'));
        yield ctx.api.sendMessage(requestingUserId, (0, i18n_1.i18n)(false).t(__language_code || "ru", 'roulette_revealed'), {
            reply_markup: (0, keyboards_1.rouletteKeyboard)(ctx.t, profileRevealed, usernameRevealed)
        });
        yield (0, sendForm_1.sendForm)(ctx, currentUser, { myForm: false, sendTo: requestingUserId });
    }
    else {
        ctx.logger.warn({
            currentUserId,
            requestingUserId,
            currentUserFound: !!currentUser,
            requestingUserFound: !!requestingUser
        }, 'Could not find one or both users for profile reveal');
    }
});
exports.revealAcceptCallbackQuery = revealAcceptCallbackQuery;
