import { prisma } from '../db/postgres';
import { logger } from '../logger';

export async function getReactionCounts(userId: string): Promise<Record<string, number>> {
    // Если userId пустой, возвращаем пустой объект
    if (!userId) {
        logger.warn('Empty userId provided for reaction counts');
        return {};
    }

    try {
        logger.info({ userId }, 'Getting reaction counts');
        
        // Получаем все реакции для пользователя
        const reactions = await prisma.rouletteReaction.findMany({
            where: {
                toUserId: userId
            }
        });

        // Создаем объект с количеством каждого типа реакции
        const counts: Record<string, number> = {};
        
        reactions.forEach(reaction => {
            const type = reaction.type;
            counts[type] = (counts[type] || 0) + 1;
        });
        
        logger.info({ userId, reactionTypes: Object.keys(counts).length }, 'Retrieved reaction counts');
        return counts;
    } catch (error) {
        logger.error({ 
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, 'Error getting reaction counts');
        return {};
    }
} 