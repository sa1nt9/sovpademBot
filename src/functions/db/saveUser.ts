import { ProfileType } from "@prisma/client";
import { prisma } from "../../db/postgres";
import { MyContext } from "../../typescript/context";
import { IProfile, TProfileSubType } from "../../typescript/interfaces/IProfile";
import { saveProfile } from "./profilesService";

interface SaveUserOptions {
    onlyProfile?: boolean;
}

const defaultOptions: SaveUserOptions = {
    onlyProfile: false
}

export async function saveUser(ctx: MyContext, options: SaveUserOptions = defaultOptions) {
    try {
        ctx.session.activeProfile.profileType = ctx.session.additionalFormInfo.selectedProfileType
        if (ctx.session.activeProfile.profileType !== ProfileType.RELATIONSHIP && ctx.session.additionalFormInfo.selectedSubType) {
            ctx.session.activeProfile.subType = ctx.session.additionalFormInfo.selectedSubType as TProfileSubType
        }
        const userData = ctx.session.activeProfile;
        const userId = String(ctx.message?.from.id);

        ctx.session.isEditingProfile = false;
        ctx.session.isCreatingProfile = false;

        if (!options.onlyProfile) {
            // Сохраняем основные данные пользователя
            const existingUser = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (existingUser) {
                // Обновляем существующего пользователя
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        name: userData.name || "",
                        city: userData.city || "",
                        gender: userData.gender || "",
                        age: userData.age || 0,
                        longitude: userData.location.longitude,
                        latitude: userData.location.latitude,
                        ownCoordinates: userData.ownCoordinates
                    },
                });

                ctx.logger.info({
                    msg: 'Основные данные пользователя обновлены',
                    userId
                });
            } else {
                // Создаем нового пользователя
                await prisma.user.create({
                    data: {
                        id: userId,
                        name: userData.name || "",
                        city: userData.city || "",
                        gender: userData.gender || "",
                        age: userData.age || 0,
                        longitude: userData.location.longitude,
                        referrerId: ctx.session.referrerId || "",
                        latitude: userData.location.latitude,
                        ownCoordinates: userData.ownCoordinates
                    },
                });

                ctx.logger.info({
                    msg: 'Новый пользователь создан',
                    userId
                });
            }
        }

        // Сохраняем профиль пользователя с помощью функции из profilesService
        if (userData.profileType) {
            try {
                const savedProfile = await saveProfile({ ...userData, userId });

                ctx.logger.info({
                    msg: 'Профиль пользователя сохранен',
                    userData,
                    profileType: userData.profileType,
                    subType: (userData as any).subType
                });

                return savedProfile;
            } catch (profileError) {
                ctx.logger.error({
                    msg: 'Ошибка при сохранении профиля',
                    error: profileError,
                    userData,
                    profileType: userData.profileType,
                    subType: (userData as any).subType
                });

                // Возвращаем null, но не прерываем выполнение функции
                return null;
            }
        }

        return null;
    } catch (error) {
        ctx.logger.error({
            msg: 'Ошибка при сохранении пользователя и профиля',
            error: error
        });
        return null;
    }
}