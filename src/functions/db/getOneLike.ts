import { prisma } from "../../db/postgres";
import { getProfileModelName } from "./profilesService";

interface UserProfile {
    id: string;
    profileType: string;
}

export async function getOneLike(id: string, type?: 'user' | 'profile') {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    if (type === 'user') {
        // Получаем все профили пользователя
        const userProfiles = await prisma.$queryRaw<UserProfile[]>`
            SELECT id, "profileType" FROM (
                SELECT id, 'RELATIONSHIP'::text as "profileType" FROM "RelationshipProfile" WHERE "userId" = ${id}
                UNION ALL
                SELECT id, 'SPORT'::text as "profileType" FROM "SportProfile" WHERE "userId" = ${id}
                UNION ALL
                SELECT id, 'GAME'::text as "profileType" FROM "GameProfile" WHERE "userId" = ${id}
                UNION ALL
                SELECT id, 'HOBBY'::text as "profileType" FROM "HobbyProfile" WHERE "userId" = ${id}
                UNION ALL
                SELECT id, 'IT'::text as "profileType" FROM "ItProfile" WHERE "userId" = ${id}
            ) as profiles
        `;

        // Получаем все ID профилей, на которые пользователь уже ответил
        const alreadyRespondedToIds = await prisma.profileLike.findMany({
            where: {
                fromProfileId: {
                    in: userProfiles.map(p => p.id)
                },
                createdAt: {
                    gte: thirtyDaysAgo
                }
            },
            select: {
                toProfileId: true
            }
        });

        // Формируем массив ID, на которые уже был дан ответ
        const respondedIds = alreadyRespondedToIds.map(item => item.toProfileId);

        // Находим первый лайк для любого из профилей пользователя
        const like = await prisma.profileLike.findFirst({
            where: {
                toProfileId: {
                    in: userProfiles.map(p => p.id)
                },
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
        const fromProfileModel = getProfileModelName(like.profileType);
        const fromProfile = await (prisma as any)[fromProfileModel].findUnique({
            where: { id: like.fromProfileId },
            include: { user: true }
        });

        // Проверяем, что профиль активен
        if (!fromProfile || !fromProfile.isActive) return null;

        return { ...like, fromProfile };

    } else {
        // Получаем все профили, которым текущий профиль уже поставил лайк или дизлайк
        const alreadyRespondedToIds = await prisma.profileLike.findMany({
            where: {
                fromProfileId: id,
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
                toProfileId: id,
                liked: true,
                createdAt: {
                    gte: thirtyDaysAgo
                },
                fromProfileId: {
                    notIn: respondedIds
                }
            }
        });

        console.log('like', like);

        if (!like) return null;

        // Получаем информацию о профиле, который поставил лайк
        const fromProfileModel = getProfileModelName(like.profileType);
        const fromProfile = await (prisma as any)[fromProfileModel].findUnique({
            where: { id: like.fromProfileId },
            include: { user: true }
        });

        console.log(fromProfile, fromProfileModel, fromProfile.isActive);

        // Проверяем, что профиль активен
        if (!fromProfile || !fromProfile.isActive) return null;

        return { ...like, fromProfile };
    }
}