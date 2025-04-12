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
    const userId = String(ctx.message?.from.id);
    
    ctx.logger.info({ 
        userId,
        onlyProfile: options.onlyProfile
    }, 'Starting user save process');

    try {
        ctx.session.activeProfile.profileType = ctx.session.additionalFormInfo.selectedProfileType;
        if (ctx.session.activeProfile.profileType !== ProfileType.RELATIONSHIP && ctx.session.additionalFormInfo.selectedSubType) {
            ctx.session.activeProfile.subType = ctx.session.additionalFormInfo.selectedSubType as TProfileSubType;
        }
        const userData = ctx.session.activeProfile;

        ctx.logger.info({ 
            userId,
            profileType: userData.profileType,
            subType: (userData as any)?.subType,
            hasName: !!userData.name,
            hasCity: !!userData.city,
            hasGender: !!userData.gender,
            hasAge: !!userData.age,
            hasLocation: !!userData.location,
            ownCoordinates: userData.ownCoordinates
        }, 'Prepared user data for saving');

        ctx.session.isEditingProfile = false;
        ctx.session.isCreatingProfile = false;

        if (!options.onlyProfile) {
            // Сохраняем основные данные пользователя
            const existingUser = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (existingUser) {
                ctx.logger.info({ 
                    userId,
                    existingName: existingUser.name,
                    existingCity: existingUser.city,
                    existingGender: existingUser.gender,
                    existingAge: existingUser.age
                }, 'Found existing user, updating data');

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
                    userId,
                    newName: userData.name,
                    newCity: userData.city,
                    newGender: userData.gender,
                    newAge: userData.age
                }, 'User data updated successfully');
            } else {
                ctx.logger.info({ userId }, 'Creating new user');

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
                    userId,
                    name: userData.name,
                    city: userData.city,
                    hasReferrer: !!ctx.session.referrerId
                }, 'New user created successfully');
            }
        }

        // Сохраняем профиль пользователя с помощью функции из profilesService
        if (userData.profileType) {
            try {
                ctx.logger.info({ 
                    userId,
                    profileType: userData.profileType,
                    subType: (userData as any)?.subType
                }, 'Starting profile save');

                const savedProfile = await saveProfile({ ...userData, userId });

                ctx.logger.info({
                    userId,
                    profileType: userData.profileType,
                    subType: (userData as any)?.subType,
                    profileId: savedProfile?.id
                }, 'Profile saved successfully');

                return savedProfile;
            } catch (profileError) {
                ctx.logger.error({
                    userId,
                    profileType: userData.profileType,
                    subType: (userData as any)?.subType,
                    error: profileError instanceof Error ? profileError.message : 'Unknown error',
                    stack: profileError instanceof Error ? profileError.stack : undefined
                }, 'Error saving profile');

                return null;
            }
        } else {
            ctx.logger.warn({ userId }, 'No profile type specified, skipping profile save');
        }

        return null;
    } catch (error) {
        ctx.logger.error({
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, 'Error in user save process');
        return null;
    }
}