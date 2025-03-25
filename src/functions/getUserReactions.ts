import { MyContext } from '../typescript/context';
import { prisma } from '../db/postgres';
import { ReactionType } from '@prisma/client';
import { REACTIONS } from '../constants/reaction';

interface GetUserReactionsOptions {
    me?: boolean;
    showTitle?: boolean;
}

export async function getUserReactions(
    ctx: MyContext, 
    userId: string, 
    options: GetUserReactionsOptions = {}
): Promise<string> {
    // Получаем все реакции пользователя
    const reactions = await prisma.rouletteReaction.findMany({
        where: {
            toUserId: userId
        }
    });

    if (reactions.length === 0) {
        return ""; // Возвращаем пустую строку вместо сообщения об отсутствии реакций
    }

    // Считаем количество реакций каждого типа
    const reactionCounts = {} as Record<ReactionType, number>;
    
    // Инициализируем счетчики для всех типов реакций
    REACTIONS.forEach(reaction => {
        reactionCounts[reaction.type] = 0;
    });

    reactions.forEach(reaction => {
        reactionCounts[reaction.type]++;
    });

    // Формируем сообщение с реакциями
    let message = '';
    
    // Если нужно показать заголовок
    if (options.showTitle) {
        message = options.me ? ctx.t('roulette_your_reactions') + ' ' : ctx.t('roulette_user_reactions') + ' ';
    }
    
    let hasReactions = false;

    // Добавляем только те реакции, которые есть у пользователя
    for (const reaction of REACTIONS) {
        const count = reactionCounts[reaction.type];
        if (count > 0) {
            const reactionKey = `roulette_reaction_${reaction.type.toLowerCase()}`;
            
            // Если это не первая реакция, добавляем разделитель
            if (hasReactions) {
                message += ` `;
            }
            
            message += ctx.t(reactionKey, { count });
            hasReactions = true;
        }
    }

    // Если нет ни одной реакции, возвращаем пустую строку
    if (!hasReactions) {
        return "";
    }

    return message;
} 