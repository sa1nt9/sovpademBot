import { MyContext } from "../../typescript/context";
import { prisma } from "../../db/postgres";

interface SaveLikeOptions {
    message?: string;
    videoFileId?: string;
    voiceFileId?: string;
    videoNoteFileId?: string;
    isMutual?: boolean;
    privateNote?: string;
    fromProfileId?: string;
}

export const saveLike = async (ctx: MyContext, targetId: string, liked: boolean, options?: SaveLikeOptions) => {
    const profileId = options?.fromProfileId || ctx.session.activeProfile.id;
    ctx.logger.info({ 
        profileId,
        targetId,
        liked,
        hasMessage: !!options?.message,
        hasVideo: !!options?.videoFileId,
        hasVoice: !!options?.voiceFileId,
        hasVideoNote: !!options?.videoNoteFileId,
        isMutual: options?.isMutual
    }, 'Starting to save like');

    try {
        // Создаем данные для лайка
        const likeData = {
            fromProfileId: profileId,
            toProfileId: targetId,
            profileType: ctx.session.activeProfile.profileType,
            liked,
            message: options?.message,
            videoFileId: options?.videoFileId,
            voiceFileId: options?.voiceFileId,
            videoNoteFileId: options?.videoNoteFileId,
            isMutual: options?.isMutual,
            isMutualAt: options?.isMutual ? new Date() : undefined,
            privateNote: options?.privateNote
        };

        // Создаем лайк
        const like = await prisma.profileLike.create({
            data: likeData
        });
        
        ctx.logger.info({ 
            profileId,
            targetId,
            likeId: like.id
        }, 'Like created successfully');

        // Проверяем взаимный лайк
        const mutualLike = await prisma.profileLike.findFirst({
            where: {
                toProfileId: profileId,
                fromProfileId: targetId,
                liked: true
            }
        });

        if (mutualLike && liked) {
            ctx.logger.info({ 
                profileId,
                targetId,
                likeId: like.id,
                mutualLikeId: mutualLike.id
            }, 'Found mutual like, updating both likes');

            // Устанавливаем взаимный лайк
            await prisma.profileLike.update({
                where: { id: like.id },
                data: { isMutual: true, isMutualAt: new Date() }
            });

            await prisma.profileLike.update({
                where: { id: mutualLike.id },
                data: { isMutual: true, isMutualAt: new Date() }
            });

            ctx.logger.info({ 
                profileId,
                targetId,
                likeId: like.id,
                mutualLikeId: mutualLike.id
            }, 'Both likes updated as mutual');
        } else if (liked) {
            ctx.logger.info({ 
                profileId,
                targetId
            }, 'No mutual like found');
        }

        return like;
    } catch (error) {
        ctx.logger.error({ 
            profileId,
            targetId,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, 'Error saving like');
        return null;
    }
} 