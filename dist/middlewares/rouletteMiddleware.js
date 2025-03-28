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
exports.rouletteMiddleware = void 0;
const postgres_1 = require("../db/postgres");
// Список команд/действий, связанных с рулеткой, которые разрешены во время рулетки
const ALLOWED_ROULETTE_ACTIONS = [
    '/roulette',
    '/stop_roulette',
    'roulette_start',
    'roulette_searching',
    'reveal_accept',
    'reveal_reject',
    'reveal_username_accept',
    'reveal_username_reject',
    'reaction',
    'complain_back',
    'complain_reason',
];
function isRouletteRelatedAction(ctx) {
    var _a, _b, _c;
    const command = (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b.split(' ')[0];
    if (command === null || command === void 0 ? void 0 : command.startsWith('/')) {
        return ALLOWED_ROULETTE_ACTIONS.some(action => action === command);
    }
    if ((_c = ctx.callbackQuery) === null || _c === void 0 ? void 0 : _c.data) {
        const callbackType = ctx.callbackQuery.data.split(':')[0];
        return ALLOWED_ROULETTE_ACTIONS.some(action => action === callbackType);
    }
    return true;
}
const rouletteMiddleware = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (ctx.inlineQuery) {
        yield next();
        return;
    }
    if (!((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id)) {
        return yield next();
    }
    const userId = String(ctx.from.id);
    try {
        const rouletteUser = yield postgres_1.prisma.rouletteUser.findUnique({
            where: { id: userId }
        });
        // Если пользователь в рулетке (ищет партнера или уже общается)
        if (rouletteUser && (rouletteUser.searchingPartner || rouletteUser.chatPartnerId)) {
            // Проверяем, связано ли действие пользователя с рулеткой
            if (!isRouletteRelatedAction(ctx)) {
                if (rouletteUser.searchingPartner) {
                    yield ctx.reply(ctx.t('roulette_searching_stop_notice'));
                }
                else if (rouletteUser.chatPartnerId) {
                    yield ctx.reply(ctx.t('roulette_chatting_stop_notice'));
                }
                return;
            }
        }
    }
    catch (error) {
        ctx.logger.error({
            error,
            action: 'Error in roulette middleware',
            userId
        });
    }
    yield next();
});
exports.rouletteMiddleware = rouletteMiddleware;
