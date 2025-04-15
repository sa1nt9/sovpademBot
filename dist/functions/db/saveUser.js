"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUser = saveUser;
const client_1 = require("@prisma/client");
const postgres_1 = require("../../db/postgres");
const profilesService_1 = require("./profilesService");
const defaultOptions = {
    onlyProfile: false
};
function saveUser(ctx_1) {
    return __awaiter(this, arguments, void 0, function* (ctx, options = defaultOptions) {
        var _a;
        const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
        ctx.logger.info({
            userId,
            onlyProfile: options.onlyProfile
        }, 'Starting user save process');
        try {
            ctx.session.activeProfile.profileType = ctx.session.additionalFormInfo.selectedProfileType;
            if (ctx.session.activeProfile.profileType !== client_1.ProfileType.RELATIONSHIP && ctx.session.additionalFormInfo.selectedSubType) {
                ctx.session.activeProfile.subType = ctx.session.additionalFormInfo.selectedSubType;
            }
            const userData = ctx.session.activeProfile;
            ctx.logger.info({
                userId,
                profileType: userData.profileType,
                subType: userData === null || userData === void 0 ? void 0 : userData.subType,
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
                const existingUser = yield postgres_1.prisma.user.findUnique({
                    where: { id: userId },
                });
                if (existingUser) {
                    // Обновляем существующего пользователя
                    yield postgres_1.prisma.user.update({
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
                }
                else {
                    ctx.logger.info({ userId }, 'Creating new user');
                    // Создаем нового пользователя
                    yield postgres_1.prisma.user.create({
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
                    const savedProfile = yield (0, profilesService_1.saveProfile)(Object.assign(Object.assign({}, userData), { userId }));
                    ctx.session.activeProfile.id = savedProfile === null || savedProfile === void 0 ? void 0 : savedProfile.id;
                    ctx.logger.info({
                        userId,
                        profileType: userData.profileType,
                        subType: userData === null || userData === void 0 ? void 0 : userData.subType,
                        profileId: savedProfile === null || savedProfile === void 0 ? void 0 : savedProfile.id
                    }, 'Profile saved successfully');
                    return savedProfile;
                }
                catch (profileError) {
                    ctx.logger.error({
                        userId,
                        profileType: userData.profileType,
                        subType: userData === null || userData === void 0 ? void 0 : userData.subType,
                        error: profileError instanceof Error ? profileError.message : 'Unknown error',
                        stack: profileError instanceof Error ? profileError.stack : undefined
                    }, 'Error saving profile');
                    return null;
                }
            }
            else {
                ctx.logger.warn({ userId }, 'No profile type specified, skipping profile save');
            }
            return null;
        }
        catch (error) {
            ctx.logger.error({
                userId,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            }, 'Error in user save process');
            return null;
        }
    });
}
