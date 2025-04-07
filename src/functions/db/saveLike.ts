import { MyContext } from "../../typescript/context";
import { prisma } from "../../db/postgres";

interface SaveLikeOptions {
    message?: string;
    videoFileId?: string;
    voiceFileId?: string;
    videoNoteFileId?: string;
    isMutual?: boolean;
    privateNote?: string;
}

export const saveLike = async (ctx: MyContext, targetId: string, liked: boolean, options?: SaveLikeOptions) => {
    try {
        // Создаем данные для лайка
        const likeData = {
            fromProfileId: ctx.session.activeProfile.id,
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

        // Проверяем взаимный лайк
        const mutualLike = await prisma.profileLike.findFirst({
            where: {
                toProfileId: ctx.session.activeProfile.id,
                fromProfileId: targetId,
                liked: true
            }
        });

        if (mutualLike && liked) {
            // Устанавливаем взаимный лайк
            await prisma.profileLike.update({
                where: { id: like.id },
                data: { isMutual: true, isMutualAt: new Date() }
            });

            await prisma.profileLike.update({
                where: { id: mutualLike.id },
                data: { isMutual: true, isMutualAt: new Date() }
            });
        }

        return like;
    } catch (error) {
        ctx.logger.error(error, 'Error saving like');
        return null;
    }
} 