import { GameType, HobbyType, ITType, ProfileType, SportType } from "@prisma/client";
import { prisma } from "../db/postgres";
import { MyContext } from "../typescript/context";

// Функция для восстановления значений профиля из базы данных
export const restoreProfileValues = async (ctx: MyContext) => {
    try {
        const userId = String(ctx.from?.id);
        if (!userId) return;

        // Получаем активный профиль пользователя
        const activeProfile = ctx.session.activeProfile;
        if (!activeProfile) return;

        // Получаем актуальные данные профиля из базы данных
        const profileModelName = `${activeProfile.profileType.toLowerCase()}Profile`;
        if (!profileModelName) return;

        // Используем динамический доступ к моделям Prisma
        let profile: any = null;

        switch (profileModelName) {
            case 'relationshipProfile':
                profile = await prisma.relationshipProfile.findFirst({
                    where: {
                        userId: userId,
                    }
                });
                break;
            case 'sportProfile':
                profile = await prisma.sportProfile.findFirst({
                    where: {
                        userId: userId,
                        ...(activeProfile.profileType !== ProfileType.RELATIONSHIP && 'subType' in activeProfile
                            ? { subType: activeProfile.subType as SportType }
                            : {})
                    }
                });
                break;
            case 'gameProfile':
                profile = await prisma.gameProfile.findFirst({
                    where: {
                        userId: userId,
                        ...(activeProfile.profileType !== ProfileType.RELATIONSHIP && 'subType' in activeProfile
                            ? { subType: activeProfile.subType as GameType }
                            : {})
                    }
                });
                break;
            case 'hobbyProfile':
                profile = await prisma.hobbyProfile.findFirst({
                    where: {
                        userId: userId,
                        ...(activeProfile.profileType !== ProfileType.RELATIONSHIP && 'subType' in activeProfile
                            ? { subType: activeProfile.subType as HobbyType }
                            : {})
                    }
                });
                break;
            case 'itProfile':
                profile = await prisma.itProfile.findFirst({
                    where: {
                        userId: userId,
                        ...(activeProfile.profileType !== ProfileType.RELATIONSHIP && 'subType' in activeProfile
                            ? { subType: activeProfile.subType as ITType }
                            : {})
                    }
                });
                break;
        }


        if (profile) {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) return;


            ctx.session.activeProfile = {
                ...ctx.session.activeProfile,
                name: user.name || "",
                age: user.age || 0,
                gender: user.gender || "",
                city: user.city || "",
                location: {
                    longitude: user.longitude || 0,
                    latitude: user.latitude || 0
                },
                ownCoordinates: user.ownCoordinates || false,
                description: profile.description || "",
                interestedIn: profile.interestedIn || "",
                files: JSON.parse(profile.files as any) || [],
                ...(activeProfile.profileType === ProfileType.SPORT
                    ? { level: profile.level || "" }
                    : {}),
                ...(activeProfile.profileType === ProfileType.GAME
                    ? { accountLink: profile.accountLink || "" }
                    : {}),
                ...(activeProfile.profileType === ProfileType.IT
                    ? { experience: profile.experience || "" }
                    : {}),
                ...(activeProfile.profileType === ProfileType.IT
                    ? { technologies: profile.technologies || "" }
                    : {}),
                ...(activeProfile.profileType === ProfileType.IT
                    ? { github: profile.github || "" }
                    : {})
            };
        }
    } catch (error) {
        ctx.logger.error(error, 'Error restoring profile values');
    }
}
