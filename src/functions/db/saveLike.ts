import { MyContext } from "../../typescript/context";
import { prisma } from "../../db/postgres";

interface SaveLikeOptions {
    message?: string;
    videoFileId?: string;
    voiceFileId?: string;
    videoNoteFileId?: string;
    isMutual?: boolean;
}

export const saveLike = async (ctx: MyContext, targetId: string, liked: boolean, options?: SaveLikeOptions) => {
    try {
        const userId = String(ctx.message?.from.id);

        const like = await prisma.userLike.create({
            data: {
                userId,
                targetId,
                liked,
                message: options?.message,
                videoFileId: options?.videoFileId,
                voiceFileId: options?.voiceFileId,
                videoNoteFileId: options?.videoNoteFileId,
                isMutual: options?.isMutual
            }
        });

        return like;
    } catch (error) {
        ctx.logger.error(error, 'Error saving like');
        return null;
    }
} 