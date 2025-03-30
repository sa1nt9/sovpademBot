import { prisma } from "../../db/postgres";
import { ProfileType } from "@prisma/client";
import { IFile } from "../../typescript/interfaces/IFile";
import { logger } from "../../logger";

// Сохранить лайк между профилями
export async function saveProfileLike(
    fromProfileType: ProfileType,
    fromProfileId: string,
    toProfileType: ProfileType,
    toProfileId: string,
    liked: boolean,
    message?: string,
    privateNote?: string,
    videoFileId?: string,
    voiceFileId?: string,
    videoNoteFileId?: string
) {
    try {
        // Проверяем, существует ли уже лайк
        const existingLike = await prisma.profileLike.findFirst({
            where: {
                fromProfileType,
                fromProfileId,
                toProfileType,
                toProfileId
            }
        });

        if (existingLike) {
            // Обновляем существующий лайк
            return await prisma.profileLike.update({
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
        } else {
            // Создаем новый лайк
            const newLike = await prisma.profileLike.create({
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
            const mutualLike = await prisma.profileLike.findFirst({
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
        }
    } catch (error) {
        logger.error({
            error,
            action: 'Error saving profile like',
            fromProfileType,
            fromProfileId,
            toProfileType,
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
    profileType: ProfileType,
    profileId: string
) {
    try {
        return await prisma.profileLike.count({
            where: {
                fromProfileType: profileType,
                fromProfileId: profileId,
                liked: true,
                isMutual: true
            }
        });
    } catch (error) {
        logger.error({
            error,
            action: 'Error getting mutual likes count',
            profileType,
            profileId
        });
        throw error;
    }
}

// Получить лайк между профилями
export async function getProfileLike(
    fromProfileType: ProfileType,
    fromProfileId: string,
    toProfileType: ProfileType,
    toProfileId: string
) {
    try {
        return await prisma.profileLike.findFirst({
            where: {
                fromProfileType,
                fromProfileId,
                toProfileType,
                toProfileId
            }
        });
    } catch (error) {
        logger.error({
            error,
            action: 'Error getting profile like',
            fromProfileType,
            fromProfileId,
            toProfileType,
            toProfileId
        });
        throw error;
    }
}

// Получить профили, которые лайкнули данный профиль
export async function getProfileLikes(
    profileType: ProfileType,
    profileId: string,
    limit: number = 10,
    offset: number = 0
) {
    try {
        return await prisma.profileLike.findMany({
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
    } catch (error) {
        logger.error({
            error,
            action: 'Error getting profile likes',
            profileType,
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
                toProfileType: profileType,
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
    profileType1: ProfileType,
    profileId1: string,
    profileType2: ProfileType,
    profileId2: string
) {
    try {
        const like1 = await prisma.profileLike.findFirst({
            where: {
                fromProfileType: profileType1,
                fromProfileId: profileId1,
                toProfileType: profileType2,
                toProfileId: profileId2,
                liked: true
            }
        });

        const like2 = await prisma.profileLike.findFirst({
            where: {
                fromProfileType: profileType2,
                fromProfileId: profileId2,
                toProfileType: profileType1,
                toProfileId: profileId1,
                liked: true
            }
        });

        return like1 !== null && like2 !== null;
    } catch (error) {
        logger.error({
            error,
            action: 'Error checking mutual like',
            profileType1,
            profileId1,
            profileType2,
            profileId2
        });
        throw error;
    }
} 