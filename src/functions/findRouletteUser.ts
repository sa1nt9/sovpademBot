import { rouletteKeyboard, rouletteStopKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { MyContext } from "../typescript/context";

export const findRouletteUser = async (ctx: MyContext) => {
    const userId = String(ctx.message?.from.id);

    await prisma.rouletteUser.upsert({
        where: { id: userId },
        create: {
            id: userId,
            searchingPartner: true
        },
        update: {
            searchingPartner: true,
            chatPartnerId: null
        }
    });

    // Ищем собеседника
    const partner = await prisma.rouletteUser.findFirst({
        where: {
            id: { not: userId },
            chatPartnerId: null,
            searchingPartner: true
        }
    });

    if (partner) {
        // Связываем пользователей
        await prisma.rouletteUser.update({
            where: { id: userId },
            data: {
                chatPartnerId: partner.id,
                searchingPartner: false,
                usernameRevealed: false,
                profileRevealed: false
            }
        });

        await prisma.rouletteUser.update({
            where: { id: partner.id },
            data: {
                chatPartnerId: userId,
                searchingPartner: false,
                usernameRevealed: false,
                profileRevealed: false
            }
        });

        await ctx.reply(ctx.t('roulette_found'), {
            reply_markup: rouletteKeyboard(ctx.t)
        });
        await ctx.api.sendMessage(partner.id, ctx.t('roulette_found'), {
            reply_markup: rouletteKeyboard(ctx.t)
        });
    } else {
        await ctx.reply(ctx.t('roulette_searching'), {
            reply_markup: rouletteStopKeyboard(ctx.t)
        });
    }
}
