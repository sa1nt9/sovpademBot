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
exports.saveForm = saveForm;
const postgres_1 = require("../../db/postgres");
function saveForm(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userData = ctx.session.form;
            const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
            const existingUser = yield postgres_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (existingUser) {
                const updatedUser = yield postgres_1.prisma.user.update({
                    where: { id: userId },
                    data: {
                        name: userData.name || "",
                        city: userData.city || "",
                        gender: userData.gender || "",
                        age: userData.age || 0,
                        interestedIn: userData.interestedIn || "",
                        longitude: userData.location.longitude,
                        latitude: userData.location.latitude,
                        text: userData.text || "",
                        files: JSON.stringify(userData.files || []),
                        ownCoordinates: userData.ownCoordinates
                    },
                });
                ctx.logger.info({
                    msg: 'Пользователь обновлен',
                    updatedUser: updatedUser
                });
                return updatedUser;
            }
            else {
                const newUser = yield postgres_1.prisma.user.create({
                    data: {
                        id: userId,
                        name: userData.name || "",
                        city: userData.city || "",
                        gender: userData.gender || "",
                        age: userData.age || 0,
                        interestedIn: userData.interestedIn || "",
                        longitude: userData.location.longitude,
                        referrerId: ctx.session.referrerId || "",
                        latitude: userData.location.latitude,
                        text: userData.text || "",
                        files: JSON.stringify(userData.files || []),
                        ownCoordinates: userData.ownCoordinates
                    },
                });
                ctx.logger.info({
                    msg: 'Новый пользователь сохранен',
                    newUser: newUser
                });
                return newUser;
            }
        }
        catch (error) {
            ctx.logger.error({
                msg: 'Ошибка при сохранении пользователя',
                error: error
            });
        }
    });
}
