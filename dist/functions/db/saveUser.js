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
const postgres_1 = require("../../db/postgres");
const profilesService_1 = require("./profilesService");
const defaultOptions = {
    onlyProfile: false
};
function saveUser(ctx_1) {
    return __awaiter(this, arguments, void 0, function* (ctx, options = defaultOptions) {
        var _a;
        try {
            const userData = ctx.session.activeProfile;
            const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
            ctx.session.isEditingProfile = false;
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
                        msg: 'Основные данные пользователя обновлены',
                        userId
                    });
                }
                else {
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
                        msg: 'Новый пользователь создан',
                        userId
                    });
                }
            }
            // Сохраняем профиль пользователя с помощью функции из profilesService
            if (userData.profileType) {
                try {
                    const savedProfile = yield (0, profilesService_1.saveProfile)(Object.assign(Object.assign({}, userData), { userId }));
                    ctx.logger.info({
                        msg: 'Профиль пользователя сохранен',
                        userData,
                        profileType: userData.profileType,
                        subType: userData.subType
                    });
                    return savedProfile;
                }
                catch (profileError) {
                    ctx.logger.error({
                        msg: 'Ошибка при сохранении профиля',
                        error: profileError,
                        userData,
                        profileType: userData.profileType,
                        subType: userData.subType
                    });
                    // Возвращаем null, но не прерываем выполнение функции
                    return null;
                }
            }
            return null;
        }
        catch (error) {
            ctx.logger.error({
                msg: 'Ошибка при сохранении пользователя и профиля',
                error: error
            });
            return null;
        }
    });
}
