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
exports.restoreProfileValues = void 0;
const client_1 = require("@prisma/client");
const postgres_1 = require("../db/postgres");
// Функция для восстановления значений профиля из базы данных
const restoreProfileValues = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
        if (!userId) {
            ctx.logger.warn('No user ID found for profile restoration');
            return;
        }
        ctx.logger.info({ userId }, 'Starting profile values restoration');
        // Получаем активный профиль пользователя
        const activeProfile = ctx.session.activeProfile;
        if (!activeProfile) {
            ctx.logger.warn({ userId }, 'No active profile found for restoration');
            return;
        }
        // Получаем актуальные данные профиля из базы данных
        const profileModelName = `${activeProfile.profileType.toLowerCase()}Profile`;
        if (!profileModelName) {
            ctx.logger.warn({ userId, profileType: activeProfile.profileType }, 'Invalid profile model name');
            return;
        }
        ctx.logger.info({
            userId,
            profileType: activeProfile.profileType,
            profileModelName
        }, 'Restoring profile values');
        // Используем динамический доступ к моделям Prisma
        let profile = null;
        switch (profileModelName) {
            case 'relationshipProfile':
                profile = yield postgres_1.prisma.relationshipProfile.findFirst({
                    where: {
                        userId: userId,
                    }
                });
                break;
            case 'sportProfile':
                profile = yield postgres_1.prisma.sportProfile.findFirst({
                    where: Object.assign({ userId: userId }, (activeProfile.profileType !== client_1.ProfileType.RELATIONSHIP && 'subType' in activeProfile
                        ? { subType: activeProfile.subType }
                        : {}))
                });
                break;
            case 'gameProfile':
                profile = yield postgres_1.prisma.gameProfile.findFirst({
                    where: Object.assign({ userId: userId }, (activeProfile.profileType !== client_1.ProfileType.RELATIONSHIP && 'subType' in activeProfile
                        ? { subType: activeProfile.subType }
                        : {}))
                });
                break;
            case 'hobbyProfile':
                profile = yield postgres_1.prisma.hobbyProfile.findFirst({
                    where: Object.assign({ userId: userId }, (activeProfile.profileType !== client_1.ProfileType.RELATIONSHIP && 'subType' in activeProfile
                        ? { subType: activeProfile.subType }
                        : {}))
                });
                break;
            case 'itProfile':
                profile = yield postgres_1.prisma.itProfile.findFirst({
                    where: Object.assign({ userId: userId }, (activeProfile.profileType !== client_1.ProfileType.RELATIONSHIP && 'subType' in activeProfile
                        ? { subType: activeProfile.subType }
                        : {}))
                });
                break;
        }
        if (profile) {
            ctx.logger.info({
                userId,
                profileType: activeProfile.profileType,
                hasProfile: true
            }, 'Found profile in database');
            const user = yield postgres_1.prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                ctx.logger.warn({ userId }, 'User not found in database');
                return;
            }
            ctx.session.activeProfile = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, ctx.session.activeProfile), { name: user.name || "", age: user.age || 0, gender: user.gender || "", city: user.city || "", location: {
                    longitude: user.longitude || 0,
                    latitude: user.latitude || 0
                }, ownCoordinates: user.ownCoordinates || false, description: profile.description || "", interestedIn: profile.interestedIn || "", files: JSON.parse(profile.files) || [] }), (activeProfile.profileType === client_1.ProfileType.SPORT
                ? { level: profile.level || "" }
                : {})), (activeProfile.profileType === client_1.ProfileType.GAME
                ? { accountLink: profile.accountLink || "" }
                : {})), (activeProfile.profileType === client_1.ProfileType.IT
                ? { experience: profile.experience || "" }
                : {})), (activeProfile.profileType === client_1.ProfileType.IT
                ? { technologies: profile.technologies || "" }
                : {})), (activeProfile.profileType === client_1.ProfileType.IT
                ? { github: profile.github || "" }
                : {}));
            ctx.logger.info({
                userId,
                profileType: activeProfile.profileType
            }, 'Successfully restored profile values');
        }
        else {
            ctx.logger.warn({
                userId,
                profileType: activeProfile.profileType
            }, 'Profile not found in database');
        }
    }
    catch (error) {
        ctx.logger.error({
            userId: (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, 'Error restoring profile values');
    }
});
exports.restoreProfileValues = restoreProfileValues;
