import { prisma } from "../../db/postgres";

export async function getLikesCount(targetUserId: string) {
    // Получаем все ID пользователей, которым текущий пользователь уже поставил лайк или дизлайк
    const alreadyRespondedToIds = await prisma.userLike.findMany({
        where: {
            userId: targetUserId, // Лайки, которые поставил текущий пользователь
        },
        select: {
            targetId: true // Выбираем только ID пользователей
        }
    });
    
    // Формируем массив ID, которым уже был дан ответ
    const respondedIds = alreadyRespondedToIds.map(item => item.targetId);
    
    const count = await prisma.userLike.count({
        where: {
            targetId: targetUserId,
            liked: true,
            user: {
                id: {
                    notIn: respondedIds // Исключаем пользователей, которым уже был дан ответ
                }
            }
        }
    });

    return count;
}

export async function getLikesInfo(targetUserId: string) {
    // Получаем все ID пользователей, которым текущий пользователь уже поставил лайк или дизлайк
    const alreadyRespondedToIds = await prisma.userLike.findMany({
        where: {
            userId: targetUserId, // Лайки, которые поставил текущий пользователь
        },
        select: {
            targetId: true // Выбираем только ID пользователей
        }
    });
    
    // Формируем массив ID, которым уже был дан ответ
    const respondedIds = alreadyRespondedToIds.map(item => item.targetId);
    
    const likers = await prisma.userLike.findMany({
        where: {
            targetId: targetUserId,
            liked: true,
            user: {
                id: {
                    notIn: respondedIds // Исключаем пользователей, которым уже был дан ответ
                }
            }
        },
        include: {
            user: {
                select: {
                    gender: true
                }
            }
        }
    });

    const count = likers.length;
    const genders = new Set(likers.map(liker => liker.user.gender));
    
    let gender: 'female' | 'male' | 'all';
    if (genders.size === 1) {
        gender = genders.has('female') ? 'female' : 'male';
    } else {
        gender = 'all';
    }

    return { count, gender };
}