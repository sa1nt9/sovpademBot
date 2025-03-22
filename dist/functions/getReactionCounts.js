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
exports.getReactionCounts = getReactionCounts;
const postgres_1 = require("../db/postgres");
function getReactionCounts(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Если userId пустой, возвращаем пустой объект
        if (!userId) {
            return {};
        }
        try {
            // Получаем все реакции для пользователя
            const reactions = yield postgres_1.prisma.rouletteReaction.findMany({
                where: {
                    toUserId: userId
                }
            });
            // Создаем объект с количеством каждого типа реакции
            const counts = {};
            reactions.forEach(reaction => {
                const type = reaction.type;
                counts[type] = (counts[type] || 0) + 1;
            });
            return counts;
        }
        catch (error) {
            console.error('Error getting reaction counts:', error);
            return {};
        }
    });
}
