import { prisma } from "../../db/postgres";
import { ProfileType } from "@prisma/client";
import { getProfileModelName } from "./profilesService";

export async function getOneLike(userId: string, profileType: ProfileType, profileId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Получаем все профили, которым текущий профиль уже поставил лайк или дизлайк
    const alreadyRespondedToIds = await prisma.profileLike.findMany({
        where: {
            fromProfileId: profileId, 
            fromProfileType: profileType,
            createdAt: {
                gte: thirtyDaysAgo 
            }
        },
        select: {
            toProfileId: true 
        }
    });
    
    // Формируем массив ID, которым уже был дан ответ
    const respondedIds = alreadyRespondedToIds.map(item => item.toProfileId);
    
    // Находим первый лайк, поставленный текущему профилю,
    // на который пользователь еще не ответил
    const like = await prisma.profileLike.findFirst({
        where: {
            toProfileId: profileId,
            toProfileType: profileType,
            liked: true,
            createdAt: {
                gte: thirtyDaysAgo 
            },
            fromProfileId: {
                notIn: respondedIds
            }
        }
    });

    if (!like) return null;

    // Получаем информацию о профиле, который поставил лайк
    const fromProfileModel = getProfileModelName(like.fromProfileType);
    const fromProfile = await (prisma as any)[fromProfileModel].findUnique({
        where: { id: like.fromProfileId },
        include: { user: true }
    });

    // Проверяем, что профиль активен
    if (!fromProfile || !fromProfile.isActive) return null;

    return { ...like, fromProfile };
}