import { prisma } from "../../db/postgres";
import { ProfileType } from "@prisma/client";
import { logger } from "../../logger";

export async function getLikesCount(targetProfileId: string, profileType: ProfileType) {
    try {
        // Получаем все ID профилей, которым текущий профиль уже поставил лайк или дизлайк
        const alreadyRespondedToIds = await prisma.profileLike.findMany({
            where: {
                fromProfileId: targetProfileId,
                fromProfileType: profileType,
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
                toProfileId: targetProfileId,
                toProfileType: profileType,
                liked: true,
                // Исключаем профили, которым уже был дан ответ
                fromProfileId: {
                    notIn: respondedIds
                }
            }
        });

        return count;
    } catch (error) {
        console.error("Error in getLikesCount:", error);
        return 0;
    }
}

export async function getLikesInfo(targetProfileId: string, profileType: ProfileType) {
    try {
        // Получаем все ID профилей, которым текущий профиль уже поставил лайк или дизлайк
        const alreadyRespondedToIds = await prisma.profileLike.findMany({
            where: {
                fromProfileId: targetProfileId,
                fromProfileType: profileType,
            },
            select: {
                toProfileId: true
            }
        });
        
        // Формируем массив ID, которым уже был дан ответ
        const respondedIds = alreadyRespondedToIds.map((item: { toProfileId: string }) => item.toProfileId);
        
        // Получаем информацию о профилях, которые поставили лайк
        const likers = await prisma.profileLike.findMany({
            where: {
                toProfileId: targetProfileId,
                toProfileType: profileType,
                liked: true,
                // Исключаем профили, которым уже был дан ответ
                fromProfileId: {
                    notIn: respondedIds
                }
            },
            include: {
                relationshipFrom: {
                    include: {
                        user: {
                            select: {
                                gender: true
                            }
                        }
                    }
                },
                sportFrom: {
                    include: {
                        user: {
                            select: {
                                gender: true
                            }
                        }
                    }
                },
                gameFrom: {
                    include: {
                        user: {
                            select: {
                                gender: true
                            }
                        }
                    }
                },
                hobbyFrom: {
                    include: {
                        user: {
                            select: {
                                gender: true
                            }
                        }
                    }
                },
                itFrom: {
                    include: {
                        user: {
                            select: {
                                gender: true
                            }
                        }
                    }
                },
            }
        });

        const count = likers.length;
        
        // Получаем пол для каждого профиля, учитывая тип профиля
        const genders = new Set(likers.map(liker => {
            let gender = 'male'; // По умолчанию
            
            // Проверяем тип профиля и получаем соответствующий объект
            switch (liker.fromProfileType) {
                case 'RELATIONSHIP':
                    gender = liker.relationshipFrom?.user?.gender || 'male';
                    break;
                case 'SPORT':
                    gender = liker.sportFrom?.user?.gender || 'male';
                    break;
                case 'GAME':
                    gender = liker.gameFrom?.user?.gender || 'male';
                    break;
                case 'HOBBY':
                    gender = liker.hobbyFrom?.user?.gender || 'male';
                    break;
                case 'IT':
                    gender = liker.itFrom?.user?.gender || 'male';
                    break;
            }
            
            return gender;
        }));
        
        let gender: 'female' | 'male' | 'all';
        if (genders.size === 1) {
            gender = genders.has('female') ? 'female' : 'male';
        } else {
            gender = 'all';
        }

        return { count, gender };
    } catch (error) {
        logger.error(error, "Error in getLikesInfo:");
        return { count: 0, gender: 'all' };
    }
}