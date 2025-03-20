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
exports.getOneLike = getOneLike;
const postgres_1 = require("../../db/postgres");
function getOneLike(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Получаем все ID пользователей, которым текущий пользователь уже поставил лайк или дизлайк
        const alreadyRespondedToIds = yield postgres_1.prisma.userLike.findMany({
            where: {
                userId: userId, // Лайки, которые поставил текущий пользователь
            },
            select: {
                targetId: true // Выбираем только ID пользователей
            }
        });
        // Формируем массив ID, которым уже был дан ответ
        const respondedIds = alreadyRespondedToIds.map(item => item.targetId);
        // Находим первый лайк, на который пользователь еще не отвечал
        return yield postgres_1.prisma.userLike.findFirst({
            where: {
                targetId: userId, // Лайки, поставленные текущему пользователю
                liked: true,
                user: {
                    id: {
                        notIn: respondedIds // Исключаем пользователей, которым уже был дан ответ
                    }
                }
            },
            include: {
                user: true
            }
        });
    });
}
