import { prisma } from "../../db/postgres";

export async function getLikesCount(targetUserId: string) {
    const count = await prisma.userLike.count({
        where: {
            targetId: targetUserId,
            liked: true
        }
    });

    return count;
}

export async function getLikesInfo(targetUserId: string) {
    const likers = await prisma.userLike.findMany({
        where: {
            targetId: targetUserId,
            liked: true
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