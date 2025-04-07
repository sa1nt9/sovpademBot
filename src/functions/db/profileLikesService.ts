import { prisma } from "../../db/postgres";
import { ProfileType } from "@prisma/client";
import { IFile } from "../../typescript/interfaces/IFile";
import { logger } from "../../logger";

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

        // Проверяем взаимный лайк
        const mutualLike = await prisma.profileLike.findFirst({
            where: {
                fromProfileId: toProfileId,
                toProfileId: fromProfileId,
                liked: true
            }
        });

        if (mutualLike && liked) {
            // Устанавливаем взаимный лайк
            await prisma.profileLike.update({
                where: { id: newLike.id },
                data: { isMutual: true, isMutualAt: new Date() }
            });

            await prisma.profileLike.update({
                where: { id: mutualLike.id },
                data: { isMutual: true, isMutualAt: new Date() }
            });
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
        return await prisma.profileLike.findMany({
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
        return await prisma.profileLike.count({
            where: {
                fromProfileId: profileId,
                liked: true,
                isMutual: true
            }
        });
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
        return await prisma.profileLike.findFirst({
            where: {
                fromProfileId,
                toProfileId
            }
        });
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
        return await prisma.profileLike.findMany({
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
        return await prisma.profileLike.count({
            where: {
                toProfileId: profileId,
                liked: true
            }
        });
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
        const like1 = await prisma.profileLike.findFirst({
            where: {
                fromProfileId: profileId1,
                toProfileId: profileId2,
                liked: true
            }
        });

        const like2 = await prisma.profileLike.findFirst({
            where: {
                fromProfileId: profileId2,
                toProfileId: profileId1,
                liked: true
            }
        });

        return like1 !== null && like2 !== null;
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