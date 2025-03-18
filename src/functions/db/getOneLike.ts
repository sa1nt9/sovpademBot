import { prisma } from "../../db/postgres";

export async function getOneLike(userId: string) {
    return await prisma.userLike.findFirst({
        where: {
            targetId: userId,
            liked: true,
            isMutual: false
        },
        include: {
            user: true
        }
    });
}