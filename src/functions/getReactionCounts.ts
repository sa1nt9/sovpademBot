import { prisma } from '../db/postgres';

export async function getReactionCounts(userId: string): Promise<Record<string, number>> {
    // Если userId пустой, возвращаем пустой объект
    if (!userId) {
        return {};
    }

    try {
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
        
        return counts;
    } catch (error) {
        console.error('Error getting reaction counts:', error);
        return {};
    }
} 