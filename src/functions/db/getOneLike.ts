import { prisma } from "../../db/postgres";

export async function getOneLike(userId: string) {
    // Получаем дату 30 дней назад (30 * 24 * 60 * 60 * 1000 миллисекунд)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Получаем все ID пользователей, которым текущий пользователь уже поставил лайк или дизлайк
    const alreadyRespondedToIds = await prisma.userLike.findMany({
        where: {
            userId: userId, // Лайки, которые поставил текущий пользователь
            createdAt: {
                gte: thirtyDaysAgo // Только за последние 30 дней
            }
        },
        select: {
            targetId: true // Выбираем только ID пользователей
        }
    });
    
    // Формируем массив ID, которым уже был дан ответ
    const respondedIds = alreadyRespondedToIds.map(item => item.targetId);
    
    // Находим первый лайк, на который пользователь еще не отвечал
    return await prisma.userLike.findFirst({
        where: {
            targetId: userId, // Лайки, поставленные текущему пользователю
            liked: true,
            createdAt: {
                gte: thirtyDaysAgo // Только за последние 30 дней
            },
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
}