import { prisma } from "../../db/postgres";
import { logger } from "../../logger";
import { getProfileModelName } from "./profilesService";

interface UserProfile {
    id: string;
    profileType: string;
}

export async function getOneLike(id: string, type?: 'user' | 'profile') {
    try {
        logger.info({ id, type }, 'Getting one like');
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const now = new Date();

        if (type === 'user') {
            // Получаем все профили пользователя
            const userProfiles = await prisma.$queryRaw<UserProfile[]>`
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
            const alreadyRespondedToIds = await prisma.profileLike.findMany({
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

            // Находим все лайки для любого из профилей пользователя
            const likes = await prisma.profileLike.findMany({
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
                },
                orderBy: {
                    createdAt: 'asc' // Сортируем по времени создания, чтобы взять самый старый лайк
                }
            });

            // Перебираем лайки и находим первый подходящий
            for (const like of likes) {
                // Получаем модель профиля из типа профиля
                const fromProfileModel = getProfileModelName(like.profileType);
                
                // Проверяем, что профиль активен
                const fromProfile = await (prisma as any)[fromProfileModel].findUnique({
                    where: { 
                        id: like.fromProfileId,
                        isActive: true 
                    },
                    include: { user: true }
                });
                
                if (!fromProfile) continue; // Пропускаем неактивные профили
                
                // Проверяем, что у пользователя нет активного бана
                const activeBan = await prisma.userBan.findFirst({
                    where: {
                        userId: fromProfile.user.id,
                        isActive: true,
                        bannedUntil: {
                            gt: now
                        }
                    }
                });
                
                if (activeBan) continue; // Пропускаем забаненных пользователей
                
                // Нашли подходящий лайк
                return { ...like, fromProfile };
            }
            
            return null; // Подходящих лайков не найдено

        } else {
            // Получаем все профили, которым текущий профиль уже поставил лайк или дизлайк
            const alreadyRespondedToIds = await prisma.profileLike.findMany({
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

            // Находим все лайки, поставленные текущему профилю,
            // на которые пользователь еще не ответил
            const likes = await prisma.profileLike.findMany({
                where: {
                    toProfileId: id,
                    liked: true,
                    createdAt: {
                        gte: thirtyDaysAgo
                    },
                    fromProfileId: {
                        notIn: respondedIds
                    }
                },
                orderBy: {
                    createdAt: 'asc' // Сортируем по времени создания, чтобы взять самый старый лайк
                }
            });

            // Перебираем лайки и находим первый подходящий
            for (const like of likes) {
                // Получаем модель профиля из типа профиля
                const fromProfileModel = getProfileModelName(like.profileType);
                
                // Проверяем, что профиль активен
                const fromProfile = await (prisma as any)[fromProfileModel].findUnique({
                    where: { 
                        id: like.fromProfileId,
                        isActive: true 
                    },
                    include: { user: true }
                });
                
                if (!fromProfile) continue; // Пропускаем неактивные профили
                
                // Проверяем, что у пользователя нет активного бана
                const activeBan = await prisma.userBan.findFirst({
                    where: {
                        userId: fromProfile.user.id,
                        isActive: true,
                        bannedUntil: {
                            gt: now
                        }
                    }
                });
                
                if (activeBan) continue; // Пропускаем забаненных пользователей
                
                // Нашли подходящий лайк
                return { ...like, fromProfile };
            }
            
            return null; // Подходящих лайков не найдено
        }
    } catch (error) {
        logger.error({ error, id, type }, 'Error in getOneLike');
        return null;
    }
}