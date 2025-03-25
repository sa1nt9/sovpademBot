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
exports.findRouletteUser = void 0;
const keyboards_1 = require("../constants/keyboards");
const postgres_1 = require("../db/postgres");
const getUserReactions_1 = require("./getUserReactions");
const getRoulettePartner_1 = require("./db/getRoulettePartner");
const sendForm_1 = require("./sendForm");
const findRouletteUser = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
    yield postgres_1.prisma.rouletteUser.upsert({
        where: { id: userId },
        create: {
            id: userId,
            searchingPartner: true
        },
        update: {
            searchingPartner: true,
            chatPartnerId: null
        }
    });
    // Используем getRoulettePartner для поиска подходящего партнера с учетом сортировки
    const partnerId = yield (0, getRoulettePartner_1.getRoulettePartner)(ctx);
    if (partnerId) {
        // Создаем новый чат в рулетке
        yield postgres_1.prisma.rouletteChat.create({
            data: {
                user1Id: userId,
                user2Id: partnerId,
                startedAt: new Date(),
                isProfileRevealed: false,
                isUsernameRevealed: false
            }
        });
        // Связываем пользователей
        yield postgres_1.prisma.rouletteUser.update({
            where: { id: userId },
            data: {
                chatPartnerId: partnerId,
                searchingPartner: false,
                usernameRevealed: false,
                profileRevealed: false
            }
        });
        yield postgres_1.prisma.rouletteUser.update({
            where: { id: partnerId },
            data: {
                chatPartnerId: userId,
                searchingPartner: false,
                usernameRevealed: false,
                profileRevealed: false
            }
        });
        // Получаем данные пользователей для отображения информации
        const currentUser = yield postgres_1.prisma.user.findUnique({ where: { id: userId } });
        const partnerUser = yield postgres_1.prisma.user.findUnique({ where: { id: partnerId } });
        const reactionsMessagePartner = yield (0, getUserReactions_1.getUserReactions)(ctx, partnerId, { showTitle: true });
        let fullMessagePartner;
        // Добавляем информацию о пользователе в сообщение
        if (currentUser && partnerUser) {
            // Информация о текущем пользователе для партнера
            const partnerInfoText = (0, sendForm_1.buildInfoText)(ctx, partnerUser, { myForm: false });
            if (reactionsMessagePartner) {
                fullMessagePartner = `${ctx.t('roulette_found')}\n\n${partnerInfoText}\n\n${reactionsMessagePartner}`;
            }
            else {
                fullMessagePartner = `${ctx.t('roulette_found')}\n\n${partnerInfoText}`;
            }
        }
        else {
            if (reactionsMessagePartner) {
                fullMessagePartner = `${ctx.t('roulette_found')}\n\n${reactionsMessagePartner}`;
            }
            else {
                fullMessagePartner = ctx.t('roulette_found');
            }
        }
        yield ctx.reply(fullMessagePartner, {
            reply_markup: (0, keyboards_1.rouletteKeyboard)(ctx.t)
        });
        const reactionsMessageYou = yield (0, getUserReactions_1.getUserReactions)(ctx, userId, { showTitle: true });
        let fullMessageYou;
        // Добавляем информацию о партнере в сообщение
        if (currentUser && partnerUser) {
            // Информация о партнере для текущего пользователя
            const userInfoText = (0, sendForm_1.buildInfoText)(ctx, currentUser, { myForm: false });
            if (reactionsMessageYou) {
                fullMessageYou = `${ctx.t('roulette_found')}\n\n${userInfoText}\n\n${reactionsMessageYou}`;
            }
            else {
                fullMessageYou = `${ctx.t('roulette_found')}\n\n${userInfoText}`;
            }
        }
        else {
            if (reactionsMessageYou) {
                fullMessageYou = `${ctx.t('roulette_found')}\n\n${reactionsMessageYou}`;
            }
            else {
                fullMessageYou = ctx.t('roulette_found');
            }
        }
        yield ctx.api.sendMessage(partnerId, fullMessageYou, {
            reply_markup: (0, keyboards_1.rouletteKeyboard)(ctx.t)
        });
    }
    else {
        yield ctx.reply(ctx.t('roulette_searching'), {
            reply_markup: (0, keyboards_1.rouletteStopKeyboard)(ctx.t)
        });
    }
});
exports.findRouletteUser = findRouletteUser;
