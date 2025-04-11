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
exports.changeSessionFieldsMiddleware = void 0;
const postgres_1 = require("../db/postgres");
const client_1 = require("@prisma/client");
const changeSessionFieldsMiddleware = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.inlineQuery) {
        yield next();
        return;
    }
    if (ctx.session.step !== 'questions' && ctx.session.isEditingProfile) {
        ctx.session.isEditingProfile = false;
        yield restoreProfileValues(ctx);
    }
    if (ctx.session.step !== 'questions' && ctx.session.additionalFormInfo.canGoBack) {
        ctx.session.additionalFormInfo.canGoBack = false;
    }
    if (ctx.session.step !== "search_people_with_likes" && ctx.session.step !== "somebodys_liked_you" && ctx.session.step !== "complain" && ctx.session.step !== "continue_see_likes_forms" && ctx.session.step !== "complain_text" && ctx.session.additionalFormInfo.searchingLikes) {
        ctx.session.additionalFormInfo.searchingLikes = false;
    }
    yield next();
});
exports.changeSessionFieldsMiddleware = changeSessionFieldsMiddleware;
// Функция для восстановления значений профиля из базы данных
function restoreProfileValues(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
            if (!userId)
                return;
            // Получаем активный профиль пользователя
            const activeProfile = ctx.session.activeProfile;
            if (!activeProfile)
                return;
            // Получаем актуальные данные профиля из базы данных
            const profileModelName = `${activeProfile.profileType.toLowerCase()}Profile`;
            if (!profileModelName)
                return;
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
                const user = yield postgres_1.prisma.user.findUnique({
                    where: { id: userId }
                });
                if (!user)
                    return;
                ctx.session.activeProfile = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, ctx.session.activeProfile), { name: user.name || "", age: user.age || 0, gender: user.gender || "", city: user.city || "", location: {
                        longitude: user.longitude || 0,
                        latitude: user.latitude || 0
                    }, ownCoordinates: user.ownCoordinates || false, description: profile.description || "", interestedIn: profile.interestedIn || "", files: profile.files || [] }), (activeProfile.profileType === client_1.ProfileType.SPORT && 'level' in profile
                    ? { level: profile.level || "" }
                    : {})), (activeProfile.profileType === client_1.ProfileType.GAME && 'accountLink' in profile
                    ? { accountLink: profile.accountLink || "" }
                    : {})), (activeProfile.profileType === client_1.ProfileType.IT && 'experience' in profile
                    ? { experience: profile.experience || "" }
                    : {})), (activeProfile.profileType === client_1.ProfileType.IT && 'technologies' in profile
                    ? { technologies: profile.technologies || "" }
                    : {})), (activeProfile.profileType === client_1.ProfileType.IT && 'github' in profile
                    ? { github: profile.github || "" }
                    : {}));
            }
        }
        catch (error) {
            ctx.logger.error(error, 'Error restoring profile values');
        }
    });
}
