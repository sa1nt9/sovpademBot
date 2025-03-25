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
exports.handleBlacklistRemove = void 0;
const postgres_1 = require("../db/postgres");
const sleepMenu_1 = require("../keyboards/sleepMenu");
const handleBlacklistRemove = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
        const targetId = (_c = (_b = ctx.callbackQuery) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.split('_')[2];
        if (!targetId) {
            yield ctx.answerCallbackQuery(ctx.t('error_occurred'));
            return;
        }
        // Удаляем пользователя из черного списка
        yield postgres_1.prisma.blacklist.deleteMany({
            where: {
                userId,
                targetId
            }
        });
        yield ctx.answerCallbackQuery(ctx.t('blacklist_remove_success'));
        // Показываем главное меню
        yield ctx.reply(ctx.t('sleep_menu'), { reply_markup: sleepMenu_1.sleepMenu });
    }
    catch (error) {
        ctx.logger.error(error, 'Error removing user from blacklist');
        yield ctx.answerCallbackQuery(ctx.t('blacklist_remove_error'));
    }
});
exports.handleBlacklistRemove = handleBlacklistRemove;
