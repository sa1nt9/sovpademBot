import { prisma } from "../../db/postgres";
import { logger } from "../../logger";

export async function setMutualLike(fromProfileId: string, toProfileId: string) {
    logger.info({ fromProfileId, toProfileId }, 'Setting mutual like');
    
    try {
        // Обновляем оригинальный лайк
        const result = await prisma.profileLike.updateMany({
            where: {
                fromProfileId: fromProfileId,
                toProfileId: toProfileId,
                liked: true
            },
            data: {
                isMutual: true,
                isMutualAt: new Date()
            }
        });

        logger.info({ 
            fromProfileId, 
            toProfileId, 
            updatedCount: result.count 
        }, 'Mutual like set successfully');
        
        return result;
    } catch (error) {
        logger.error({
            fromProfileId,
            toProfileId,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, 'Error setting mutual like');
        throw error;
    }
} 