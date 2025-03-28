import { prisma } from "../../db/postgres";

export async function getOneLike(userId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const alreadyRespondedToIds = await prisma.userLike.findMany({
        where: {
            userId: userId, 
            createdAt: {
                gte: thirtyDaysAgo 
            }
        },
        select: {
            targetId: true 
        }
    });
    
    // Формируем массив ID, которым уже был дан ответ
    const respondedIds = alreadyRespondedToIds.map(item => item.targetId);
    
    return await prisma.userLike.findFirst({
        where: {
            targetId: userId,
            liked: true,
            createdAt: {
                gte: thirtyDaysAgo 
            },
            user: {
                id: {
                    notIn: respondedIds
                },
                isActive: true
            }
        },
        include: {
            user: true
        }
    });
}