import { notHaveFormToDeactiveKeyboard, rouletteStartKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { showRouletteStart } from "../messages/roulette_start";
import { MyContext } from "../typescript/context";

export const rouletteCommand = async (ctx: MyContext) => {
    const userId = String(ctx.from?.id);

    ctx.logger.info({ userId }, 'Starting roulette command');

    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (existingUser) {
        ctx.logger.info({ userId }, 'Showing roulette start menu');
        ctx.session.step = 'roulette_start';
        await showRouletteStart(ctx);
    } else {
        ctx.session.step = "you_dont_have_form";
        ctx.logger.warn({ userId }, 'User tried to start roulette without profile');

        await ctx.reply(ctx.t('you_dont_have_form'), {
            reply_markup: notHaveFormToDeactiveKeyboard(ctx.t)
        });
    }
}