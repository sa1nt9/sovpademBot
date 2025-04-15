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
exports.checkForBanMiddleware = void 0;
const postgres_1 = require("../db/postgres");
const date_fns_1 = require("date-fns");
const checkForBanMiddleware = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (ctx.inlineQuery) {
        yield next();
        return;
    }
    const userId = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
    // Проверяем, есть ли активный бан для пользователя
    const now = new Date();
    const activeBan = yield postgres_1.prisma.userBan.findFirst({
        where: {
            userId: userId,
            isActive: true,
            bannedUntil: {
                gt: now
            }
        }
    });
    if (activeBan) {
        const banEndDate = (0, date_fns_1.format)(activeBan.bannedUntil, "d MMMM yyyy 'в' HH:mm");
        let banMessage = "";
        const isPermanent = activeBan.bannedUntil.getFullYear() > 2100;
        if (isPermanent) {
            banMessage += ctx.t("user_banned_permanent") + "\n\n";
        }
        else {
            banMessage += ctx.t("user_banned_until", { date: banEndDate }) + "\n\n";
        }
        if (activeBan.reason) {
            banMessage += "\n\n" + ctx.t("user_banned_reason", { reason: activeBan.reason });
        }
        yield ctx.reply(banMessage);
        return;
    }
    yield next();
});
exports.checkForBanMiddleware = checkForBanMiddleware;
