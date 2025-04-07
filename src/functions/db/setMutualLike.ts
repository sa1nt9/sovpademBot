import { prisma } from "../../db/postgres";

export async function setMutualLike(fromProfileId: string, toProfileId: string) {
    // Обновляем оригинальный лайк
    await prisma.profileLike.updateMany({
        where: {
            fromProfileId: fromProfileId,
            toProfileId: toProfileId,
            liked: true
        },
        data: {
            isMutual: true,
            isMutualAt: new Date()
        }
    });
} 