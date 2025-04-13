import { profileKeyboard, rouletteKeyboard, rouletteStartKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { findRouletteUser } from "../functions/findRouletteUser";
import { getUserReactions } from "../functions/getUserReactions";
import { sendForm } from "../functions/sendForm";
import { MyContext } from "../typescript/context";
import { logger } from "../logger"; 

export const rouletteStartStep = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    const userId = String(ctx.message?.from.id);
    
    ctx.logger.info({ userId }, 'Starting roulette step');

    if (message === ctx.t('main_menu')) {
        ctx.session.step = 'profile';

        await sendForm(ctx)
        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else if (message === ctx.t('roulette_find')) {
        ctx.session.step = 'roulette_searching';

        // Проверяем наличие активной анкеты
        const existingUser = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (existingUser) {
            ctx.logger.info({ userId }, 'Found existing user, starting roulette search');
            await findRouletteUser(ctx)
        } else {
            ctx.logger.info({ userId }, 'User not found, redirecting to form creation');
            ctx.session.step = "you_dont_have_form";

            await ctx.reply(ctx.t('you_dont_have_form'), {
                reply_markup: profileKeyboard()
            });
        }
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: rouletteStartKeyboard(ctx.t)
        });
    }
}

// Вызывается для отображения стартового экрана рулетки с реакциями
export async function showRouletteStart(ctx: MyContext) {
    const userId = String(ctx.from?.id);
    
    ctx.logger.info({ userId }, 'Showing roulette start screen');

    const reactionsMessage = await getUserReactions(ctx, userId, { me: true, showTitle: true });

    let fullMessage;

    if (reactionsMessage) {
        fullMessage = ctx.t('roulette_start', { reactions: `\n${reactionsMessage}\n` });
    } else {
        fullMessage = ctx.t('roulette_start', { reactions: '' });
    }

    await ctx.reply(fullMessage, {
        reply_markup: rouletteStartKeyboard(ctx.t)
    });
}