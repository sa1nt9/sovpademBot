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
exports.getLikesCount = getLikesCount;
exports.getLikesInfo = getLikesInfo;
const postgres_1 = require("../../db/postgres");
const logger_1 = require("../../logger");
function getLikesCount(targetId, type) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (type === 'user') {
                // Получаем все профили пользователя
                const userProfiles = yield postgres_1.prisma.$queryRaw `
                SELECT id, "profileType" FROM (
                    SELECT id, 'RELATIONSHIP'::text as "profileType" FROM "RelationshipProfile" WHERE "userId" = ${targetId}
                    UNION ALL
                    SELECT id, 'SPORT'::text as "profileType" FROM "SportProfile" WHERE "userId" = ${targetId}
                    UNION ALL
                    SELECT id, 'GAME'::text as "profileType" FROM "GameProfile" WHERE "userId" = ${targetId}
                    UNION ALL
                    SELECT id, 'HOBBY'::text as "profileType" FROM "HobbyProfile" WHERE "userId" = ${targetId}
                    UNION ALL
                    SELECT id, 'IT'::text as "profileType" FROM "ItProfile" WHERE "userId" = ${targetId}
                ) as profiles
            `;
                // Получаем все ID профилей, на которые пользователь уже ответил
                const alreadyRespondedToIds = yield postgres_1.prisma.profileLike.findMany({
                    where: {
                        fromProfileId: {
                            in: userProfiles.map((p) => p.id)
                        }
                    },
                    select: {
                        toProfileId: true
                    }
                });
                // Формируем массив ID, на которые уже был дан ответ
                const respondedIds = alreadyRespondedToIds.map((item) => item.toProfileId);
                // Подсчитываем количество лайков для всех профилей пользователя
                const count = yield postgres_1.prisma.profileLike.count({
                    where: {
                        toProfileId: {
                            in: userProfiles.map((p) => p.id)
                        },
                        liked: true,
                        // Исключаем профили, которым уже был дан ответ
                        fromProfileId: {
                            notIn: respondedIds
                        }
                    }
                });
                return count;
            }
            else {
                // Получаем все ID профилей, которым текущий профиль уже поставил лайк или дизлайк
                const alreadyRespondedToIds = yield postgres_1.prisma.profileLike.findMany({
                    where: {
                        fromProfileId: targetId,
                    },
                    select: {
                        toProfileId: true
                    }
                });
                // Формируем массив ID, которым уже был дан ответ
                const respondedIds = alreadyRespondedToIds.map((item) => item.toProfileId);
                // Подсчитываем количество лайков, полученных профилем
                const count = yield postgres_1.prisma.profileLike.count({
                    where: {
                        toProfileId: targetId,
                        liked: true,
                        // Исключаем профили, которым уже был дан ответ
                        fromProfileId: {
                            notIn: respondedIds
                        }
                    }
                });
                return count;
            }
        }
        catch (error) {
            console.error("Error in getLikesCount:", error);
            return 0;
        }
    });
}
function getLikesInfo(targetId, type) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (type === 'user') {
                // Получаем все профили пользователя
                const userProfiles = yield postgres_1.prisma.$queryRaw `
                SELECT id, "profileType" FROM (
                    SELECT id, 'RELATIONSHIP'::text as "profileType" FROM "RelationshipProfile" WHERE "userId" = ${targetId}
                    UNION ALL
                    SELECT id, 'SPORT'::text as "profileType" FROM "SportProfile" WHERE "userId" = ${targetId}
                    UNION ALL
                    SELECT id, 'GAME'::text as "profileType" FROM "GameProfile" WHERE "userId" = ${targetId}
                    UNION ALL
                    SELECT id, 'HOBBY'::text as "profileType" FROM "HobbyProfile" WHERE "userId" = ${targetId}
                    UNION ALL
                    SELECT id, 'IT'::text as "profileType" FROM "ItProfile" WHERE "userId" = ${targetId}
                ) as profiles
            `;
                // Получаем все ID профилей, на которые пользователь уже ответил
                const alreadyRespondedToIds = yield postgres_1.prisma.profileLike.findMany({
                    where: {
                        fromProfileId: {
                            in: userProfiles.map((p) => p.id)
                        }
                    },
                    select: {
                        toProfileId: true
                    }
                });
                // Формируем массив ID, на которые уже был дан ответ
                const respondedIds = alreadyRespondedToIds.map((item) => item.toProfileId);
                // Получаем все лайки для всех профилей пользователя
                const likers = yield postgres_1.prisma.profileLike.findMany({
                    where: {
                        toProfileId: {
                            in: userProfiles.map((p) => p.id)
                        },
                        liked: true,
                        // Исключаем профили, которым уже был дан ответ
                        fromProfileId: {
                            notIn: respondedIds
                        }
                    }
                });
                const count = likers.length;
                // Группируем лайки по типу профиля
                const likersByType = likers.reduce((acc, liker) => {
                    if (!acc[liker.profileType]) {
                        acc[liker.profileType] = [];
                    }
                    acc[liker.profileType].push(liker.fromProfileId);
                    return acc;
                }, {});
                const genders = new Set();
                // Для каждого типа профиля получаем информацию о пользователях
                for (const [profileType, profileIds] of Object.entries(likersByType)) {
                    let users;
                    switch (profileType) {
                        case 'RELATIONSHIP': {
                            users = yield postgres_1.prisma.relationshipProfile.findMany({
                                where: { id: { in: profileIds } },
                                include: { user: { select: { gender: true } } }
                            });
                            break;
                        }
                        case 'SPORT': {
                            users = yield postgres_1.prisma.sportProfile.findMany({
                                where: { id: { in: profileIds } },
                                include: { user: { select: { gender: true } } }
                            });
                            break;
                        }
                        case 'GAME': {
                            users = yield postgres_1.prisma.gameProfile.findMany({
                                where: { id: { in: profileIds } },
                                include: { user: { select: { gender: true } } }
                            });
                            break;
                        }
                        case 'HOBBY': {
                            users = yield postgres_1.prisma.hobbyProfile.findMany({
                                where: { id: { in: profileIds } },
                                include: { user: { select: { gender: true } } }
                            });
                            break;
                        }
                        case 'IT': {
                            users = yield postgres_1.prisma.itProfile.findMany({
                                where: { id: { in: profileIds } },
                                include: { user: { select: { gender: true } } }
                            });
                            break;
                        }
                    }
                    // Добавляем пол каждого пользователя в множество
                    users === null || users === void 0 ? void 0 : users.forEach(user => {
                        genders.add(user.user.gender || 'male');
                    });
                }
                let gender;
                if (genders.size === 1) {
                    gender = genders.has('female') ? 'female' : 'male';
                }
                else {
                    gender = 'all';
                }
                return { count, gender };
            }
            else {
                // Получаем все ID профилей, которым текущий профиль уже поставил лайк или дизлайк
                const alreadyRespondedToIds = yield postgres_1.prisma.profileLike.findMany({
                    where: {
                        fromProfileId: targetId,
                    },
                    select: {
                        toProfileId: true
                    }
                });
                // Формируем массив ID, которым уже был дан ответ
                const respondedIds = alreadyRespondedToIds.map((item) => item.toProfileId);
                // Получаем все лайки, которые получил профиль
                const likers = yield postgres_1.prisma.profileLike.findMany({
                    where: {
                        toProfileId: targetId,
                        liked: true,
                        // Исключаем профили, которым уже был дан ответ
                        fromProfileId: {
                            notIn: respondedIds
                        }
                    }
                });
                const count = likers.length;
                // Группируем лайки по типу профиля
                const likersByType = likers.reduce((acc, liker) => {
                    if (!acc[liker.profileType]) {
                        acc[liker.profileType] = [];
                    }
                    acc[liker.profileType].push(liker.fromProfileId);
                    return acc;
                }, {});
                const genders = new Set();
                // Для каждого типа профиля получаем информацию о пользователях
                for (const [profileType, profileIds] of Object.entries(likersByType)) {
                    let users;
                    switch (profileType) {
                        case 'RELATIONSHIP': {
                            users = yield postgres_1.prisma.relationshipProfile.findMany({
                                where: { id: { in: profileIds } },
                                include: { user: { select: { gender: true } } }
                            });
                            break;
                        }
                        case 'SPORT': {
                            users = yield postgres_1.prisma.sportProfile.findMany({
                                where: { id: { in: profileIds } },
                                include: { user: { select: { gender: true } } }
                            });
                            break;
                        }
                        case 'GAME': {
                            users = yield postgres_1.prisma.gameProfile.findMany({
                                where: { id: { in: profileIds } },
                                include: { user: { select: { gender: true } } }
                            });
                            break;
                        }
                        case 'HOBBY': {
                            users = yield postgres_1.prisma.hobbyProfile.findMany({
                                where: { id: { in: profileIds } },
                                include: { user: { select: { gender: true } } }
                            });
                            break;
                        }
                        case 'IT': {
                            users = yield postgres_1.prisma.itProfile.findMany({
                                where: { id: { in: profileIds } },
                                include: { user: { select: { gender: true } } }
                            });
                            break;
                        }
                    }
                    // Добавляем пол каждого пользователя в множество
                    users === null || users === void 0 ? void 0 : users.forEach(user => {
                        genders.add(user.user.gender || 'male');
                    });
                }
                let gender;
                if (genders.size === 1) {
                    gender = genders.has('female') ? 'female' : 'male';
                }
                else {
                    gender = 'all';
                }
                return { count, gender };
            }
        }
        catch (error) {
            logger_1.logger.error(error, "Error in getLikesInfo:");
            return { count: 0, gender: 'all' };
        }
    });
}
