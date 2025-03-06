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
exports.toggleUserActive = void 0;
const postgres_1 = require("../../db/postgres");
const toggleUserActive = (ctx, isActive) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
        // Сначала получаем текущего пользователя
        const currentUser = yield postgres_1.prisma.user.findUnique({
            where: { id: userId },
            select: { isActive: true }
        });
        // Если статус не изменился, возвращаем текущего пользователя
        if ((currentUser === null || currentUser === void 0 ? void 0 : currentUser.isActive) === isActive) {
            return currentUser;
        }
        // Если статус отличается, обновляем
        const updatedUser = yield postgres_1.prisma.user.update({
            where: { id: userId },
            data: { isActive }
        });
        return updatedUser;
    }
    catch (error) {
        ctx.logger.error(error, 'Error toggling user active status');
        return null;
    }
});
exports.toggleUserActive = toggleUserActive;
