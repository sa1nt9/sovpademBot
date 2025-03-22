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
exports.getUserReactions = getUserReactions;
const postgres_1 = require("../db/postgres");
const reaction_1 = require("../constants/reaction");
function getUserReactions(ctx, userId, me) {
    return __awaiter(this, void 0, void 0, function* () {
        // Получаем все реакции пользователя
        const reactions = yield postgres_1.prisma.rouletteReaction.findMany({
            where: {
                toUserId: userId
            }
        });
        if (reactions.length === 0) {
            return ""; // Возвращаем пустую строку вместо сообщения об отсутствии реакций
        }
        // Считаем количество реакций каждого типа
        const reactionCounts = {};
        // Инициализируем счетчики для всех типов реакций
        reaction_1.REACTIONS.forEach(reaction => {
            reactionCounts[reaction.type] = 0;
        });
        reactions.forEach(reaction => {
            reactionCounts[reaction.type]++;
        });
        // Формируем сообщение с реакциями
        let message = me ? ctx.t('roulette_your_reactions') + ' ' : ctx.t('roulette_user_reactions') + ' ';
        let hasReactions = false;
        // Добавляем только те реакции, которые есть у пользователя
        for (const reaction of reaction_1.REACTIONS) {
            const count = reactionCounts[reaction.type];
            if (count > 0) {
                const reactionKey = `roulette_reaction_${reaction.type.toLowerCase()}`;
                message += ctx.t(reactionKey, { count }) + ' ';
                hasReactions = true;
            }
        }
        // Если нет ни одной реакции, возвращаем пустую строку
        if (!hasReactions) {
            return "";
        }
        return message;
    });
}
