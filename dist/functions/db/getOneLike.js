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
const profilesService_1 = require("./profilesService");
function getOneLike(userId, profileType, profileId) {
    return __awaiter(this, void 0, void 0, function* () {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        // Получаем все профили, которым текущий профиль уже поставил лайк или дизлайк
        const alreadyRespondedToIds = yield postgres_1.prisma.profileLike.findMany({
            where: {
                fromProfileId: profileId,
                fromProfileType: profileType,
                createdAt: {
                    gte: thirtyDaysAgo
                }
            },
            select: {
                toProfileId: true
            }
        });
        // Формируем массив ID, которым уже был дан ответ
        const respondedIds = alreadyRespondedToIds.map(item => item.toProfileId);
        // Находим первый лайк, поставленный текущему профилю,
        // на который пользователь еще не ответил
        const like = yield postgres_1.prisma.profileLike.findFirst({
            where: {
                toProfileId: profileId,
                toProfileType: profileType,
                liked: true,
                createdAt: {
                    gte: thirtyDaysAgo
                },
                fromProfileId: {
                    notIn: respondedIds
                }
            }
        });
        if (!like)
            return null;
        // Получаем информацию о профиле, который поставил лайк
        const fromProfileModel = (0, profilesService_1.getProfileModelName)(like.fromProfileType);
        const fromProfile = yield postgres_1.prisma[fromProfileModel].findUnique({
            where: { id: like.fromProfileId },
            include: { user: true }
        });
        // Проверяем, что профиль активен
        if (!fromProfile || !fromProfile.isActive)
            return null;
        return Object.assign(Object.assign({}, like), { fromProfile });
    });
}
