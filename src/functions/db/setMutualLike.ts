import { prisma } from "../../db/postgres";

export async function setMutualLike(userId: string, targetId: string) {
    // Обновляем оригинальный лайк
    await prisma.profileLike.updateMany({
        where: {
            fromProfileId: userId,
            toProfileId: targetId,
            liked: true
        },
        data: {
            isMutual: true,
            isMutualAt: new Date()
        }
    });
} 