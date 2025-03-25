import { MyContext } from "../typescript/context";
import { prisma } from "../db/postgres";
import { rouletteReactionKeyboard, rouletteStartKeyboard } from "../constants/keyboards";
import { getReactionCounts } from "../functions/getReactionCounts";

export const stopRouletteCommand = async (ctx: MyContext) => {
    const userId = String(ctx.from?.id);
    
    ctx.logger.info({
        action: 'Command stop_roulette',
        userId
    });
    
    try {
        // Получаем информацию о пользователе и его статусе в рулетке
        const existingUser = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                rouletteUser: true
            }
        });
        
        // Если пользователь не найден или нет записи в rouletteUser
        if (!existingUser || !existingUser.rouletteUser) {
            await ctx.reply(ctx.t('roulette_not_in_chat'), {
                reply_markup: rouletteStartKeyboard(ctx.t)
            });
            return;
        }
        
        // Если пользователь в чате с партнером
        if (existingUser.rouletteUser.chatPartnerId) {
            const partnerUserId = existingUser.rouletteUser.chatPartnerId;
            
            // Обновляем статус партнера
            await prisma.rouletteUser.update({
                where: { id: partnerUserId },
                data: {
                    chatPartnerId: null,
                    searchingPartner: false,
                    usernameRevealed: false,
                    profileRevealed: false
                }
            });

            await prisma.rouletteChat.updateMany({
                where: {
                    OR: [
                        { user1Id: userId, user2Id: partnerUserId, endedAt: null },
                        { user1Id: partnerUserId, user2Id: userId, endedAt: null }
                    ]
                },
                data: {
                    endedAt: new Date(),
                    isProfileRevealed: existingUser.rouletteUser.profileRevealed,
                    isUsernameRevealed: existingUser.rouletteUser.usernameRevealed
                }
            });
            
            // Уведомляем партнеру о завершении чата
            await ctx.api.sendMessage(partnerUserId, ctx.t('roulette_partner_left'), {
                reply_markup: rouletteStartKeyboard(ctx.t)
            });
            
            // Получаем количество реакций для пользователя
            const userReactionCounts = await getReactionCounts(userId);
            
            // Предлагаем партнеру оценить пользователя
            await ctx.api.sendMessage(partnerUserId, ctx.t('roulette_put_reaction_on_your_partner'), {
                reply_markup: rouletteReactionKeyboard(ctx.t, userId, userReactionCounts)
            });
            
            // Обновляем статус самого пользователя
            await prisma.rouletteUser.update({
                where: { id: userId },
                data: {
                    chatPartnerId: null,
                    searchingPartner: false,
                    usernameRevealed: false,
                    profileRevealed: false
                }
            });
            
            // Сообщаем пользователю о завершении чата
            await ctx.reply(ctx.t('roulette_chat_ended'), {
                reply_markup: rouletteStartKeyboard(ctx.t)
            });
            
            // Предлагаем пользователю оценить партнера
            const partnerReactionCounts = await getReactionCounts(partnerUserId);
            
            await ctx.reply(ctx.t('roulette_put_reaction_on_your_partner'), {
                reply_markup: rouletteReactionKeyboard(ctx.t, partnerUserId, partnerReactionCounts)
            });
            
        } 
        // Если пользователь в поиске партнера
        else if (existingUser.rouletteUser.searchingPartner) {
            // Обновляем статус пользователя
            await prisma.rouletteUser.update({
                where: { id: userId },
                data: {
                    searchingPartner: false
                }
            });
            
            // Сообщаем пользователю об остановке поиска
            await ctx.reply(ctx.t('roulette_stop_searching_success'), {
                reply_markup: rouletteStartKeyboard(ctx.t)
            });
            
            // Обновляем шаг сессии
            ctx.session.step = "roulette_start";
        } 
        // Если пользователь не в чате и не в поиске
        else {
            await ctx.reply(ctx.t('roulette_not_in_chat'), {
                reply_markup: rouletteStartKeyboard(ctx.t)
            });
        }
    } catch (error) {
        ctx.logger.error({
            error,
            action: 'Error executing stop_roulette command',
            userId
        });
        
        await ctx.reply(ctx.t('error_occurred'));
    }
}