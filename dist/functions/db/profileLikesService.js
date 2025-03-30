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
exports.saveProfileLike = saveProfileLike;
exports.getMutualLikes = getMutualLikes;
exports.getMutualLikesCount = getMutualLikesCount;
exports.getProfileLike = getProfileLike;
exports.getProfileLikes = getProfileLikes;
exports.getProfileLikesCount = getProfileLikesCount;
exports.hasMutualLike = hasMutualLike;
const postgres_1 = require("../../db/postgres");
const logger_1 = require("../../logger");
// Сохранить лайк между профилями
function saveProfileLike(fromProfileType, fromProfileId, toProfileType, toProfileId, liked, message, privateNote, videoFileId, voiceFileId, videoNoteFileId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Проверяем, существует ли уже лайк
            const existingLike = yield postgres_1.prisma.profileLike.findFirst({
                where: {
                    fromProfileType,
                    fromProfileId,
                    toProfileType,
                    toProfileId
                }
            });
            if (existingLike) {
                // Обновляем существующий лайк
                return yield postgres_1.prisma.profileLike.update({
                    where: { id: existingLike.id },
                    data: {
                        liked,
                        message,
                        privateNote,
                        videoFileId,
                        voiceFileId,
                        videoNoteFileId
                    }
                });
            }
            else {
                // Создаем новый лайк
                const newLike = yield postgres_1.prisma.profileLike.create({
                    data: {
                        fromProfileType,
                        fromProfileId,
                        toProfileType,
                        toProfileId,
                        liked,
                        message,
                        privateNote,
                        videoFileId,
                        voiceFileId,
                        videoNoteFileId
                    }
                });
                // Проверяем взаимный лайк
                const mutualLike = yield postgres_1.prisma.profileLike.findFirst({
                    where: {
                        fromProfileType: toProfileType,
                        fromProfileId: toProfileId,
                        toProfileType: fromProfileType,
                        toProfileId: fromProfileId,
                        liked: true
                    }
                });
                if (mutualLike && liked) {
                    // Устанавливаем взаимный лайк
                    yield postgres_1.prisma.profileLike.update({
                        where: { id: newLike.id },
                        data: { isMutual: true, isMutualAt: new Date() }
                    });
                    yield postgres_1.prisma.profileLike.update({
                        where: { id: mutualLike.id },
                        data: { isMutual: true, isMutualAt: new Date() }
                    });
                }
                return newLike;
            }
        }
        catch (error) {
            logger_1.logger.error({
                error,
                action: 'Error saving profile like',
                fromProfileType,
                fromProfileId,
                toProfileType,
                toProfileId
            });
            throw error;
        }
    });
}
// Получить взаимные лайки для профиля
function getMutualLikes(profileType_1, profileId_1) {
    return __awaiter(this, arguments, void 0, function* (profileType, profileId, limit = 100, offset = 0) {
        try {
            return yield postgres_1.prisma.profileLike.findMany({
                where: {
                    fromProfileType: profileType,
                    fromProfileId: profileId,
                    liked: true,
                    isMutual: true
                },
                orderBy: {
                    isMutualAt: 'desc'
                },
                skip: offset,
                take: limit
            });
        }
        catch (error) {
            logger_1.logger.error({
                error,
                action: 'Error getting mutual likes',
                profileType,
                profileId,
                limit,
                offset
            });
            throw error;
        }
    });
}
// Получить количество взаимных лайков для профиля
function getMutualLikesCount(profileType, profileId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield postgres_1.prisma.profileLike.count({
                where: {
                    fromProfileType: profileType,
                    fromProfileId: profileId,
                    liked: true,
                    isMutual: true
                }
            });
        }
        catch (error) {
            logger_1.logger.error({
                error,
                action: 'Error getting mutual likes count',
                profileType,
                profileId
            });
            throw error;
        }
    });
}
// Получить лайк между профилями
function getProfileLike(fromProfileType, fromProfileId, toProfileType, toProfileId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield postgres_1.prisma.profileLike.findFirst({
                where: {
                    fromProfileType,
                    fromProfileId,
                    toProfileType,
                    toProfileId
                }
            });
        }
        catch (error) {
            logger_1.logger.error({
                error,
                action: 'Error getting profile like',
                fromProfileType,
                fromProfileId,
                toProfileType,
                toProfileId
            });
            throw error;
        }
    });
}
// Получить профили, которые лайкнули данный профиль
function getProfileLikes(profileType_1, profileId_1) {
    return __awaiter(this, arguments, void 0, function* (profileType, profileId, limit = 10, offset = 0) {
        try {
            return yield postgres_1.prisma.profileLike.findMany({
                where: {
                    toProfileType: profileType,
                    toProfileId: profileId,
                    liked: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip: offset,
                take: limit
            });
        }
        catch (error) {
            logger_1.logger.error({
                error,
                action: 'Error getting profile likes',
                profileType,
                profileId,
                limit,
                offset
            });
            throw error;
        }
    });
}
// Получить количество лайков для профиля
function getProfileLikesCount(profileType, profileId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield postgres_1.prisma.profileLike.count({
                where: {
                    toProfileType: profileType,
                    toProfileId: profileId,
                    liked: true
                }
            });
        }
        catch (error) {
            logger_1.logger.error({
                error,
                action: 'Error getting profile likes count',
                profileType,
                profileId
            });
            throw error;
        }
    });
}
// Проверить, есть ли взаимный лайк между профилями
function hasMutualLike(profileType1, profileId1, profileType2, profileId2) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const like1 = yield postgres_1.prisma.profileLike.findFirst({
                where: {
                    fromProfileType: profileType1,
                    fromProfileId: profileId1,
                    toProfileType: profileType2,
                    toProfileId: profileId2,
                    liked: true
                }
            });
            const like2 = yield postgres_1.prisma.profileLike.findFirst({
                where: {
                    fromProfileType: profileType2,
                    fromProfileId: profileId2,
                    toProfileType: profileType1,
                    toProfileId: profileId1,
                    liked: true
                }
            });
            return like1 !== null && like2 !== null;
        }
        catch (error) {
            logger_1.logger.error({
                error,
                action: 'Error checking mutual like',
                profileType1,
                profileId1,
                profileType2,
                profileId2
            });
            throw error;
        }
    });
}
