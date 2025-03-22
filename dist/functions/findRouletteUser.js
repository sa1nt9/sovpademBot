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
    // Ищем собеседника
    const partner = yield postgres_1.prisma.rouletteUser.findFirst({
        where: {
            id: { not: userId },
            chatPartnerId: null,
            searchingPartner: true
        }
    });
    if (partner) {
        // Связываем пользователей
        yield postgres_1.prisma.rouletteUser.update({
            where: { id: userId },
            data: {
                chatPartnerId: partner.id,
                searchingPartner: false,
                usernameRevealed: false,
                profileRevealed: false
            }
        });
        yield postgres_1.prisma.rouletteUser.update({
            where: { id: partner.id },
            data: {
                chatPartnerId: userId,
                searchingPartner: false,
                usernameRevealed: false,
                profileRevealed: false
            }
        });
        yield ctx.reply(ctx.t('roulette_found'), {
            reply_markup: (0, keyboards_1.rouletteKeyboard)(ctx.t)
        });
        yield ctx.api.sendMessage(partner.id, ctx.t('roulette_found'), {
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
