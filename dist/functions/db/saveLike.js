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
exports.saveLike = void 0;
const postgres_1 = require("../../db/postgres");
const saveLike = (ctx, targetId, liked, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Создаем данные для лайка
        const likeData = {
            fromProfileId: ctx.session.activeProfile.id,
            toProfileId: targetId,
            profileType: ctx.session.activeProfile.profileType,
            liked,
            message: options === null || options === void 0 ? void 0 : options.message,
            videoFileId: options === null || options === void 0 ? void 0 : options.videoFileId,
            voiceFileId: options === null || options === void 0 ? void 0 : options.voiceFileId,
            videoNoteFileId: options === null || options === void 0 ? void 0 : options.videoNoteFileId,
            isMutual: options === null || options === void 0 ? void 0 : options.isMutual,
            isMutualAt: (options === null || options === void 0 ? void 0 : options.isMutual) ? new Date() : undefined,
            privateNote: options === null || options === void 0 ? void 0 : options.privateNote
        };
        // Создаем лайк
        const like = yield postgres_1.prisma.profileLike.create({
            data: likeData
        });
        // Проверяем взаимный лайк
        const mutualLike = yield postgres_1.prisma.profileLike.findFirst({
            where: {
                toProfileId: ctx.session.activeProfile.id,
                fromProfileId: targetId,
                liked: true
            }
        });
        if (mutualLike && liked) {
            // Устанавливаем взаимный лайк
            yield postgres_1.prisma.profileLike.update({
                where: { id: like.id },
                data: { isMutual: true, isMutualAt: new Date() }
            });
            yield postgres_1.prisma.profileLike.update({
                where: { id: mutualLike.id },
                data: { isMutual: true, isMutualAt: new Date() }
            });
        }
        return like;
    }
    catch (error) {
        ctx.logger.error(error, 'Error saving like');
        return null;
    }
});
exports.saveLike = saveLike;
