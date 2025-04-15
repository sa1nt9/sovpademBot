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
function saveProfileLike(profileType, fromProfileId, toProfileId, liked, message, privateNote, videoFileId, voiceFileId, videoNoteFileId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_1.logger.info({ profileType, fromProfileId, toProfileId, liked }, 'Starting to save profile like');
            // Создаем новый лайк
            const newLike = yield postgres_1.prisma.profileLike.create({
                data: {
                    profileType,
                    fromProfileId,
                    toProfileId,
                    liked,
                    message,
                    privateNote,
                    videoFileId,
                    voiceFileId,
                    videoNoteFileId
                }
            });
            logger_1.logger.info({ likeId: newLike.id }, 'New like created successfully');
            // Проверяем взаимный лайк
            logger_1.logger.info({ fromProfileId: toProfileId, toProfileId: fromProfileId }, 'Checking for mutual like');
            const mutualLike = yield postgres_1.prisma.profileLike.findFirst({
                where: {
                    fromProfileId: toProfileId,
                    toProfileId: fromProfileId,
                    liked: true
                }
            });
            if (mutualLike && liked) {
                logger_1.logger.info({ mutualLikeId: mutualLike.id }, 'Mutual like found, updating both likes');
                // Устанавливаем взаимный лайк
                yield postgres_1.prisma.profileLike.update({
                    where: { id: newLike.id },
                    data: { isMutual: true, isMutualAt: new Date() }
                });
                yield postgres_1.prisma.profileLike.update({
                    where: { id: mutualLike.id },
                    data: { isMutual: true, isMutualAt: new Date() }
                });
                logger_1.logger.info('Mutual likes updated successfully');
            }
            return newLike;
        }
        catch (error) {
            logger_1.logger.error({
                error,
                action: 'Error saving profile like',
                profileType,
                fromProfileId,
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
            logger_1.logger.info({ profileType, profileId, limit, offset }, 'Getting mutual likes');
            const likes = yield postgres_1.prisma.profileLike.findMany({
                where: {
                    profileType: profileType,
                    liked: true,
                    isMutual: true
                },
                orderBy: {
                    isMutualAt: 'desc'
                },
                skip: offset,
                take: limit
            });
            logger_1.logger.info({ count: likes.length }, 'Mutual likes retrieved successfully');
            return likes;
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
function getMutualLikesCount(profileId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_1.logger.info({ profileId }, 'Getting mutual likes count');
            const count = yield postgres_1.prisma.profileLike.count({
                where: {
                    fromProfileId: profileId,
                    liked: true,
                    isMutual: true
                }
            });
            logger_1.logger.info({ profileId, count }, 'Mutual likes count retrieved');
            return count;
        }
        catch (error) {
            logger_1.logger.error({
                error,
                action: 'Error getting mutual likes count',
                profileId
            });
            throw error;
        }
    });
}
// Получить лайк между профилями
function getProfileLike(fromProfileId, toProfileId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_1.logger.info({ fromProfileId, toProfileId }, 'Getting profile like');
            const like = yield postgres_1.prisma.profileLike.findFirst({
                where: {
                    fromProfileId,
                    toProfileId
                }
            });
            logger_1.logger.info({ found: !!like }, 'Profile like search completed');
            return like;
        }
        catch (error) {
            logger_1.logger.error({
                error,
                action: 'Error getting profile like',
                fromProfileId,
                toProfileId
            });
            throw error;
        }
    });
}
// Получить профили, которые лайкнули данный профиль
function getProfileLikes(profileId_1) {
    return __awaiter(this, arguments, void 0, function* (profileId, limit = 10, offset = 0) {
        try {
            logger_1.logger.info({ profileId, limit, offset }, 'Getting profile likes');
            const likes = yield postgres_1.prisma.profileLike.findMany({
                where: {
                    toProfileId: profileId,
                    liked: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip: offset,
                take: limit
            });
            logger_1.logger.info({ profileId, count: likes.length }, 'Profile likes retrieved successfully');
            return likes;
        }
        catch (error) {
            logger_1.logger.error({
                error,
                action: 'Error getting profile likes',
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
            logger_1.logger.info({ profileType, profileId }, 'Getting profile likes count');
            const count = yield postgres_1.prisma.profileLike.count({
                where: {
                    toProfileId: profileId,
                    liked: true
                }
            });
            logger_1.logger.info({ profileId, count }, 'Profile likes count retrieved');
            return count;
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
function hasMutualLike(profileId1, profileId2) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_1.logger.info({ profileId1, profileId2 }, 'Checking for mutual like');
            const like1 = yield postgres_1.prisma.profileLike.findFirst({
                where: {
                    fromProfileId: profileId1,
                    toProfileId: profileId2,
                    liked: true
                }
            });
            logger_1.logger.info({ found: !!like1 }, 'First like check completed');
            const like2 = yield postgres_1.prisma.profileLike.findFirst({
                where: {
                    fromProfileId: profileId2,
                    toProfileId: profileId1,
                    liked: true
                }
            });
            logger_1.logger.info({ found: !!like2 }, 'Second like check completed');
            const hasMutual = like1 !== null && like2 !== null;
            logger_1.logger.info({ hasMutual }, 'Mutual like check completed');
            return hasMutual;
        }
        catch (error) {
            logger_1.logger.error({
                error,
                action: 'Error checking mutual like',
                profileId1,
                profileId2
            });
            throw error;
        }
    });
}
