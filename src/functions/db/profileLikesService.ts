import { prisma } from "../../db/postgres";
import { ProfileType } from "@prisma/client";
import { IFile } from "../../typescript/interfaces/IFile";
import { logger } from "../../logger";
import { getProfileModelName } from "./profilesService";

// Сохранить лайк между профилями
export async function saveProfileLike(
    profileType: ProfileType,
    fromProfileId: string,
    toProfileId: string,
    liked: boolean,
    message?: string,
    privateNote?: string,
    videoFileId?: string,
    voiceFileId?: string,
    videoNoteFileId?: string
) {
    try {
        logger.info({ profileType, fromProfileId, toProfileId, liked }, 'Starting to save profile like');
        
        // Создаем новый лайк
        const newLike = await prisma.profileLike.create({
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
        
        logger.info({ likeId: newLike.id }, 'New like created successfully');

        // Проверяем взаимный лайк
        logger.info({ fromProfileId: toProfileId, toProfileId: fromProfileId }, 'Checking for mutual like');
        const mutualLike = await prisma.profileLike.findFirst({
            where: {
                fromProfileId: toProfileId,
                toProfileId: fromProfileId,
                liked: true
            }
        });

        if (mutualLike && liked) {
            logger.info({ mutualLikeId: mutualLike.id }, 'Mutual like found, updating both likes');
            // Устанавливаем взаимный лайк
            await prisma.profileLike.update({
                where: { id: newLike.id },
                data: { isMutual: true, isMutualAt: new Date() }
            });

            await prisma.profileLike.update({
                where: { id: mutualLike.id },
                data: { isMutual: true, isMutualAt: new Date() }
            });
            logger.info('Mutual likes updated successfully');
        }

        return newLike;
    } catch (error) {
        logger.error({
            error,
            action: 'Error saving profile like',
            profileType,
            fromProfileId,
            toProfileId
        });
        throw error;
    }
}

// Получить взаимные лайки для профиля
export async function getMutualLikes(
    profileType: ProfileType,
    profileId: string,
    limit: number = 100,
    offset: number = 0
) {
    try {
        logger.info({ profileType, profileId, limit, offset }, 'Getting mutual likes');
        const likes = await prisma.profileLike.findMany({
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
        logger.info({ count: likes.length }, 'Mutual likes retrieved successfully');
        return likes;
    } catch (error) {
        logger.error({
            error,
            action: 'Error getting mutual likes',
            profileType,
            profileId,
            limit,
            offset
        });
        throw error;
    }
}

// Получить количество взаимных лайков для профиля
export async function getMutualLikesCount(
    profileId: string
) {
    try {
        logger.info({ profileId }, 'Getting mutual likes count');
        const count = await prisma.profileLike.count({
            where: {
                fromProfileId: profileId,
                liked: true,
                isMutual: true
            }
        });
        logger.info({ profileId, count }, 'Mutual likes count retrieved');
        return count;
    } catch (error) {
        logger.error({
            error,
            action: 'Error getting mutual likes count',
            profileId
        });
        throw error;
    }
}

// Получить лайк между профилями
export async function getProfileLike(
    fromProfileId: string,
    toProfileId: string
) {
    try {
        logger.info({ fromProfileId, toProfileId }, 'Getting profile like');
        const like = await prisma.profileLike.findFirst({
            where: {
                fromProfileId,
                toProfileId
            }
        });
        logger.info({ found: !!like }, 'Profile like search completed');
        return like;
    } catch (error) {
        logger.error({
            error,
            action: 'Error getting profile like',
            fromProfileId,
            toProfileId
        });
        throw error;
    }
}

// Получить профили, которые лайкнули данный профиль
export async function getProfileLikes(
    profileId: string,
    limit: number = 10,
    offset: number = 0
) {
    try {
        logger.info({ profileId, limit, offset }, 'Getting profile likes');
        const likes = await prisma.profileLike.findMany({
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
        logger.info({ profileId, count: likes.length }, 'Profile likes retrieved successfully');
        return likes;
    } catch (error) {
        logger.error({
            error,
            action: 'Error getting profile likes',
            profileId,
            limit,
            offset
        });
        throw error;
    }
}

// Получить количество лайков для профиля
export async function getProfileLikesCount(
    profileType: ProfileType,
    profileId: string
) {
    try {
        logger.info({ profileType, profileId }, 'Getting profile likes count');
        const count = await prisma.profileLike.count({
            where: {
                toProfileId: profileId,
                liked: true
            }
        });
        logger.info({ profileId, count }, 'Profile likes count retrieved');
        return count;
    } catch (error) {
        logger.error({
            error,
            action: 'Error getting profile likes count',
            profileType,
            profileId
        });
        throw error;
    }
}

// Проверить, есть ли взаимный лайк между профилями
export async function hasMutualLike(
    profileId1: string,
    profileId2: string
) {
    try {
        logger.info({ profileId1, profileId2 }, 'Checking for mutual like');
        const like1 = await prisma.profileLike.findFirst({
            where: {
                fromProfileId: profileId1,
                toProfileId: profileId2,
                liked: true
            }
        });
        logger.info({ found: !!like1 }, 'First like check completed');

        const like2 = await prisma.profileLike.findFirst({
            where: {
                fromProfileId: profileId2,
                toProfileId: profileId1,
                liked: true
            }
        });
        logger.info({ found: !!like2 }, 'Second like check completed');

        const hasMutual = like1 !== null && like2 !== null;
        logger.info({ hasMutual }, 'Mutual like check completed');
        return hasMutual;
    } catch (error) {
        logger.error({
            error,
            action: 'Error checking mutual like',
            profileId1,
            profileId2
        });
        throw error;
    }
} 