import { prisma } from "../../db/postgres";
import { logger } from "../../logger";
import { ProfileType } from "@prisma/client";

interface UserProfile {
    id: string;
    profileType: string;
}

export async function getLikesCount(targetId: string, type?: 'user' | 'profile') {
    try {
        if (type === 'user') {
            // Получаем все профили пользователя
            const userProfiles = await prisma.$queryRaw<UserProfile[]>`
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
            const alreadyRespondedToIds = await prisma.profileLike.findMany({
                where: {
                    fromProfileId: {
                        in: userProfiles.map((p: { id: string }) => p.id)
                    }
                },
                select: {
                    toProfileId: true
                }
            });

            // Формируем массив ID, на которые уже был дан ответ
            const respondedIds = alreadyRespondedToIds.map((item: { toProfileId: string }) => item.toProfileId);

            // Подсчитываем количество лайков для всех профилей пользователя
            const count = await prisma.profileLike.count({
                where: {
                    toProfileId: {
                        in: userProfiles.map((p: { id: string }) => p.id)
                    },
                    liked: true,
                    // Исключаем профили, которым уже был дан ответ
                    fromProfileId: {
                        notIn: respondedIds
                    }
                }
            });

            return count;
        } else {
            // Получаем все ID профилей, которым текущий профиль уже поставил лайк или дизлайк
            const alreadyRespondedToIds = await prisma.profileLike.findMany({
                where: {
                    fromProfileId: targetId,
                },
                select: {
                    toProfileId: true
                }
            });

            // Формируем массив ID, которым уже был дан ответ
            const respondedIds = alreadyRespondedToIds.map((item: { toProfileId: string }) => item.toProfileId);

            // Подсчитываем количество лайков, полученных профилем
            const count = await prisma.profileLike.count({
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
    } catch (error) {
        console.error("Error in getLikesCount:", error);
        return 0;
    }
}

export async function getLikesInfo(targetId: string, type?: 'user' | 'profile') {
    try {
        if (type === 'user') {
            // Получаем все профили пользователя
            const userProfiles = await prisma.$queryRaw<UserProfile[]>`
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
            const alreadyRespondedToIds = await prisma.profileLike.findMany({
                where: {
                    fromProfileId: {
                        in: userProfiles.map((p: { id: string }) => p.id)
                    }
                },
                select: {
                    toProfileId: true
                }
            });

            // Формируем массив ID, на которые уже был дан ответ
            const respondedIds = alreadyRespondedToIds.map((item: { toProfileId: string }) => item.toProfileId);

            // Получаем все лайки для всех профилей пользователя
            const likers = await prisma.profileLike.findMany({
                where: {
                    toProfileId: {
                        in: userProfiles.map((p: { id: string }) => p.id)
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
            }, {} as Record<string, string[]>);

            const genders = new Set<string>();

            // Для каждого типа профиля получаем информацию о пользователях
            for (const [profileType, profileIds] of Object.entries(likersByType)) {
                let users;

                switch (profileType) {
                    case 'RELATIONSHIP': {
                        users = await prisma.relationshipProfile.findMany({
                            where: { id: { in: profileIds } },
                            include: { user: { select: { gender: true } } }
                        });
                        break;
                    }
                    case 'SPORT': {
                        users = await prisma.sportProfile.findMany({
                            where: { id: { in: profileIds } },
                            include: { user: { select: { gender: true } } }
                        });
                        break;
                    }
                    case 'GAME': {
                        users = await prisma.gameProfile.findMany({
                            where: { id: { in: profileIds } },
                            include: { user: { select: { gender: true } } }
                        });
                        break;
                    }
                    case 'HOBBY': {
                        users = await prisma.hobbyProfile.findMany({
                            where: { id: { in: profileIds } },
                            include: { user: { select: { gender: true } } }
                        });
                        break;
                    }
                    case 'IT': {
                        users = await prisma.itProfile.findMany({
                            where: { id: { in: profileIds } },
                            include: { user: { select: { gender: true } } }
                        });
                        break;
                    }
                }

                // Добавляем пол каждого пользователя в множество
                users?.forEach(user => {
                    genders.add(user.user.gender || 'male');
                });
            }

            let gender: 'female' | 'male' | 'all';
            if (genders.size === 1) {
                gender = genders.has('female') ? 'female' : 'male';
            } else {
                gender = 'all';
            }

            return { count, gender };
        } else {
            // Получаем все ID профилей, которым текущий профиль уже поставил лайк или дизлайк
            const alreadyRespondedToIds = await prisma.profileLike.findMany({
                where: {
                    fromProfileId: targetId,
                },
                select: {
                    toProfileId: true
                }
            });

            // Формируем массив ID, которым уже был дан ответ
            const respondedIds = alreadyRespondedToIds.map((item: { toProfileId: string }) => item.toProfileId);

            // Получаем все лайки, которые получил профиль
            const likers = await prisma.profileLike.findMany({
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
            }, {} as Record<string, string[]>);

            const genders = new Set<string>();

            // Для каждого типа профиля получаем информацию о пользователях
            for (const [profileType, profileIds] of Object.entries(likersByType)) {
                let users;

                switch (profileType) {
                    case 'RELATIONSHIP': {
                        users = await prisma.relationshipProfile.findMany({
                            where: { id: { in: profileIds } },
                            include: { user: { select: { gender: true } } }
                        });
                        break;
                    }
                    case 'SPORT': {
                        users = await prisma.sportProfile.findMany({
                            where: { id: { in: profileIds } },
                            include: { user: { select: { gender: true } } }
                        });
                        break;
                    }
                    case 'GAME': {
                        users = await prisma.gameProfile.findMany({
                            where: { id: { in: profileIds } },
                            include: { user: { select: { gender: true } } }
                        });
                        break;
                    }
                    case 'HOBBY': {
                        users = await prisma.hobbyProfile.findMany({
                            where: { id: { in: profileIds } },
                            include: { user: { select: { gender: true } } }
                        });
                        break;
                    }
                    case 'IT': {
                        users = await prisma.itProfile.findMany({
                            where: { id: { in: profileIds } },
                            include: { user: { select: { gender: true } } }
                        });
                        break;
                    }
                }

                // Добавляем пол каждого пользователя в множество
                users?.forEach(user => {
                    genders.add(user.user.gender || 'male');
                });
            }

            let gender: 'female' | 'male' | 'all';
            if (genders.size === 1) {
                gender = genders.has('female') ? 'female' : 'male';
            } else {
                gender = 'all';
            }

            return { count, gender };
        }
    } catch (error) {
        logger.error(error, "Error in getLikesInfo:");
        return { count: 0, gender: 'all' };
    }
}