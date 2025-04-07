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
function getOneLike(id, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        if (type === 'user') {
            // Получаем все профили пользователя
            const userProfiles = yield postgres_1.prisma.$queryRaw `
            SELECT id, "profileType" FROM (
                SELECT id, 'RELATIONSHIP'::text as "profileType" FROM "RelationshipProfile" WHERE "userId" = ${id}
                UNION ALL
                SELECT id, 'SPORT'::text as "profileType" FROM "SportProfile" WHERE "userId" = ${id}
                UNION ALL
                SELECT id, 'GAME'::text as "profileType" FROM "GameProfile" WHERE "userId" = ${id}
                UNION ALL
                SELECT id, 'HOBBY'::text as "profileType" FROM "HobbyProfile" WHERE "userId" = ${id}
                UNION ALL
                SELECT id, 'IT'::text as "profileType" FROM "ItProfile" WHERE "userId" = ${id}
            ) as profiles
        `;
            // Получаем все ID профилей, на которые пользователь уже ответил
            const alreadyRespondedToIds = yield postgres_1.prisma.profileLike.findMany({
                where: {
                    fromProfileId: {
                        in: userProfiles.map(p => p.id)
                    },
                    createdAt: {
                        gte: thirtyDaysAgo
                    }
                },
                select: {
                    toProfileId: true
                }
            });
            // Формируем массив ID, на которые уже был дан ответ
            const respondedIds = alreadyRespondedToIds.map(item => item.toProfileId);
            // Находим первый лайк для любого из профилей пользователя
            const like = yield postgres_1.prisma.profileLike.findFirst({
                where: {
                    toProfileId: {
                        in: userProfiles.map(p => p.id)
                    },
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
            const fromProfileModel = (0, profilesService_1.getProfileModelName)(like.profileType);
            const fromProfile = yield postgres_1.prisma[fromProfileModel].findUnique({
                where: { id: like.fromProfileId },
                include: { user: true }
            });
            // Проверяем, что профиль активен
            if (!fromProfile || !fromProfile.isActive)
                return null;
            return Object.assign(Object.assign({}, like), { fromProfile });
        }
        else {
            // Получаем все профили, которым текущий профиль уже поставил лайк или дизлайк
            const alreadyRespondedToIds = yield postgres_1.prisma.profileLike.findMany({
                where: {
                    fromProfileId: id,
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
                    toProfileId: id,
                    liked: true,
                    createdAt: {
                        gte: thirtyDaysAgo
                    },
                    fromProfileId: {
                        notIn: respondedIds
                    }
                }
            });
            console.log('like', like);
            if (!like)
                return null;
            // Получаем информацию о профиле, который поставил лайк
            const fromProfileModel = (0, profilesService_1.getProfileModelName)(like.profileType);
            const fromProfile = yield postgres_1.prisma[fromProfileModel].findUnique({
                where: { id: like.fromProfileId },
                include: { user: true }
            });
            console.log(fromProfile, fromProfileModel, fromProfile.isActive);
            // Проверяем, что профиль активен
            if (!fromProfile || !fromProfile.isActive)
                return null;
            return Object.assign(Object.assign({}, like), { fromProfile });
        }
    });
}
