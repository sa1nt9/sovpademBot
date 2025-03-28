import { prisma } from "../../db/postgres";

export async function setMutualLike(userId: string, targetId: string) {
    // Обновляем оригинальный лайк
    await prisma.userLike.updateMany({
        where: {
            userId: userId,
            targetId: targetId,
            liked: true
        },
        data: {
            isMutual: true,
            isMutualAt: new Date()
        }
    });
} 