import { prisma } from "../../db/postgres";
import { logger } from "../../logger";
import { ProfileType } from "@prisma/client";

interface UserProfile {
    id: string;
    profileType: string;
}

export async function getLikesCount(targetId: string, type?: 'user' | 'profile') {
    try {
        logger.info({ targetId, type }, 'Getting likes count');
        const now = new Date();
        
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

            // Получаем лайки для подсчета
            const likes = await prisma.profileLike.findMany({
                where: {
                    toProfileId: {
                        in: userProfiles.map((p: { id: string }) => p.id)
                    },
                    liked: true,
                    // Исключаем профили, которым уже был дан ответ
                    fromProfileId: {
                        notIn: respondedIds
                    }
                },
                select: {
                    fromProfileId: true,
                    profileType: true
                }
            });

            // Фильтруем лайки по активности профиля и отсутствию бана
            let validCount = 0;
            
            for (const like of likes) {
                // Получаем модель профиля из типа профиля
                const profileModel = like.profileType.toLowerCase() + 'Profile';
                const firstLetterUpperCase = profileModel.charAt(0).toUpperCase() + profileModel.slice(1);
                
                // Проверяем активность профиля
                const fromProfile = await (prisma as any)[firstLetterUpperCase].findFirst({
                    where: { 
                        id: like.fromProfileId,
                        isActive: true
                    },
                    select: {
                        userId: true
                    }
                });
                
                if (!fromProfile) continue;
                
                // Проверяем наличие бана у пользователя
                const activeBan = await prisma.userBan.findFirst({
                    where: {
                        userId: fromProfile.userId,
                        isActive: true,
                        bannedUntil: {
                            gt: now
                        }
                    }
                });
                
                // Если нет активного бана, засчитываем лайк
                if (!activeBan) {
                    validCount++;
                }
            }
            
            return validCount;
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

            // Получаем лайки для подсчета
            const likes = await prisma.profileLike.findMany({
                where: {
                    toProfileId: targetId,
                    liked: true,
                    // Исключаем профили, которым уже был дан ответ
                    fromProfileId: {
                        notIn: respondedIds
                    }
                },
                select: {
                    fromProfileId: true,
                    profileType: true
                }
            });

            // Фильтруем лайки по активности профиля и отсутствию бана
            let validCount = 0;
            
            for (const like of likes) {
                // Получаем модель профиля из типа профиля
                const profileModel = like.profileType.toLowerCase() + 'Profile';
                const firstLetterUpperCase = profileModel.charAt(0).toUpperCase() + profileModel.slice(1);
                
                // Проверяем активность профиля
                const fromProfile = await (prisma as any)[firstLetterUpperCase].findFirst({
                    where: { 
                        id: like.fromProfileId,
                        isActive: true
                    },
                    select: {
                        userId: true
                    }
                });
                
                if (!fromProfile) continue;
                
                // Проверяем наличие бана у пользователя
                const activeBan = await prisma.userBan.findFirst({
                    where: {
                        userId: fromProfile.userId,
                        isActive: true,
                        bannedUntil: {
                            gt: now
                        }
                    }
                });
                
                // Если нет активного бана, засчитываем лайк
                if (!activeBan) {
                    validCount++;
                }
            }
            
            return validCount;
        }
    } catch (error) {
        logger.error({ error, targetId, type }, 'Error in getLikesCount');
        return 0;
    }
}

export async function getLikesInfo(targetId: string, type?: 'user' | 'profile') {
    try {
        logger.info({ targetId, type }, 'Getting likes info');
        const now = new Date();
        
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

            // Создаем массивы для валидных лайков и связанных с ними полов пользователей
            const validLikerIds = [];
            const genders = new Set<string>();

            // Проверяем каждый лайк на активность профиля и отсутствие бана
            for (const liker of likers) {
                // Получаем модель профиля из типа профиля
                const profileModel = liker.profileType.toLowerCase() + 'Profile';
                const firstLetterUpperCase = profileModel.charAt(0).toUpperCase() + profileModel.slice(1);
                
                // Проверяем активность профиля
                const fromProfile = await (prisma as any)[firstLetterUpperCase].findFirst({
                    where: { 
                        id: liker.fromProfileId,
                        isActive: true
                    },
                    include: {
                        user: {
                            select: { 
                                gender: true,
                                id: true
                            }
                        }
                    }
                });
                
                if (!fromProfile) continue;
                
                // Проверяем наличие бана у пользователя
                const activeBan = await prisma.userBan.findFirst({
                    where: {
                        userId: fromProfile.user.id,
                        isActive: true,
                        bannedUntil: {
                            gt: now
                        }
                    }
                });
                
                // Если нет активного бана, добавляем в список валидных и учитываем пол
                if (!activeBan) {
                    validLikerIds.push(liker.id);
                    genders.add(fromProfile.user.gender || 'male');
                }
            }

            const count = validLikerIds.length;

            // Определяем преобладающий пол
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

            // Создаем массивы для валидных лайков и связанных с ними полов пользователей
            const validLikerIds = [];
            const genders = new Set<string>();

            // Проверяем каждый лайк на активность профиля и отсутствие бана
            for (const liker of likers) {
                // Получаем модель профиля из типа профиля
                const profileModel = liker.profileType.toLowerCase() + 'Profile';
                const firstLetterUpperCase = profileModel.charAt(0).toUpperCase() + profileModel.slice(1);
                
                // Проверяем активность профиля
                const fromProfile = await (prisma as any)[firstLetterUpperCase].findFirst({
                    where: { 
                        id: liker.fromProfileId,
                        isActive: true
                    },
                    include: {
                        user: {
                            select: { 
                                gender: true,
                                id: true
                            }
                        }
                    }
                });
                
                if (!fromProfile) continue;
                
                // Проверяем наличие бана у пользователя
                const activeBan = await prisma.userBan.findFirst({
                    where: {
                        userId: fromProfile.user.id,
                        isActive: true,
                        bannedUntil: {
                            gt: now
                        }
                    }
                });
                
                // Если нет активного бана, добавляем в список валидных и учитываем пол
                if (!activeBan) {
                    validLikerIds.push(liker.id);
                    genders.add(fromProfile.user.gender || 'male');
                }
            }

            const count = validLikerIds.length;

            // Определяем преобладающий пол
            let gender: 'female' | 'male' | 'all';
            if (genders.size === 1) {
                gender = genders.has('female') ? 'female' : 'male';
            } else {
                gender = 'all';
            }

            return { count, gender };
        }
    } catch (error) {
        logger.error({ error, targetId, type }, 'Error in getLikesInfo');
        return { count: 0, gender: 'all' };
    }
}