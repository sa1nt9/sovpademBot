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
    var _a, _b;
    const callbackQuery = ctx.callbackQuery;
    const callbackData = callbackQuery.data;
    const userId = callbackData.split(":")[1];
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
        where: { id: String(callbackQuery.from.id) },
        include: { rouletteUser: true }
    });
    const requestingUser = yield postgres_1.prisma.user.findUnique({
        where: { id: userId },
        include: { rouletteUser: true }
    });
    if (currentUser && requestingUser) {
        // Обновляем статус раскрытия имен пользователей для обоих пользователей
        if (currentUser.rouletteUser) {
            yield postgres_1.prisma.rouletteUser.update({
                where: { id: currentUser.id },
                data: { usernameRevealed: true }
            });
        }
        if (requestingUser.rouletteUser) {
            yield postgres_1.prisma.rouletteUser.update({
                where: { id: userId },
                data: { usernameRevealed: true }
            });
        }
        const userInfo = yield ctx.api.getChat(requestingUser.id);
        const profileRevealed = ((_a = currentUser.rouletteUser) === null || _a === void 0 ? void 0 : _a.profileRevealed) || false;
        const usernameRevealed = true;
        yield ctx.reply(ctx.t('roulette_revealed_username') + `[${requestingUser.name}](https://t.me/${userInfo.username})`, {
            parse_mode: 'Markdown',
            reply_markup: (0, keyboards_1.rouletteKeyboard)(ctx.t, profileRevealed, usernameRevealed)
        });
        const currentSession = yield postgres_1.prisma.session.findUnique({
            where: {
                key: userId
            }
        });
        const { __language_code } = currentSession ? JSON.parse(currentSession.value) : {};
        yield ctx.api.sendMessage(userId, (0, i18n_1.i18n)(false).t(__language_code || "ru", 'roulette_revealed_username_by_partner') + `[${currentUser.name}](https://t.me/${(_b = callbackQuery.from) === null || _b === void 0 ? void 0 : _b.username})`, {
            parse_mode: 'Markdown',
            reply_markup: (0, keyboards_1.rouletteKeyboard)(ctx.t, profileRevealed, usernameRevealed)
        });
    }
});
exports.revealUsernameAcceptCallbackQuery = revealUsernameAcceptCallbackQuery;
