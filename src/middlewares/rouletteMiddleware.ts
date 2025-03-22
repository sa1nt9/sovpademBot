import { MyContext } from "../typescript/context";
import { prisma } from "../db/postgres";

// Список команд/действий, связанных с рулеткой, которые разрешены во время рулетки
const ALLOWED_ROULETTE_ACTIONS = [
    '/roulette',
    '/stop_roulette',
    'roulette_start',
    'roulette_searching',
    'reveal_accept',
    'reveal_reject',
    'reveal_username_accept',
    'reveal_username_reject',
    'reaction',
    'complain_back',
    'complain_reason',
];

function isRouletteRelatedAction(ctx: MyContext): boolean {
    const command = ctx.message?.text?.split(' ')[0];

    if (command?.startsWith('/')) {
        return ALLOWED_ROULETTE_ACTIONS.some(action => action === command);
    }


    if (ctx.callbackQuery?.data) {
        const callbackType = ctx.callbackQuery.data.split(':')[0];

        return ALLOWED_ROULETTE_ACTIONS.some(action => action === callbackType);
    }

    return true;
}

export const rouletteMiddleware = async (ctx: MyContext, next: () => Promise<void>) => {
    if (!ctx.from?.id) {
        return await next();
    }

    const userId = String(ctx.from.id);

    try {
        const rouletteUser = await prisma.rouletteUser.findUnique({
            where: { id: userId }
        });
        

        // Если пользователь в рулетке (ищет партнера или уже общается)
        if (rouletteUser && (rouletteUser.searchingPartner || rouletteUser.chatPartnerId)) {
            // Проверяем, связано ли действие пользователя с рулеткой
            if (!isRouletteRelatedAction(ctx)) {

                if (rouletteUser.searchingPartner) {
                    await ctx.reply(ctx.t('roulette_searching_stop_notice'));
                } else if (rouletteUser.chatPartnerId) {
                    await ctx.reply(ctx.t('roulette_chatting_stop_notice'));
                }

                return;
            }
        }
    } catch (error) {
        ctx.logger.error({
            error,
            action: 'Error in roulette middleware',
            userId
        });
    }

    await next();
};