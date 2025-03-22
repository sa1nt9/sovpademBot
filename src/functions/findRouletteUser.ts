import { rouletteKeyboard, rouletteStopKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { MyContext } from "../typescript/context";
import { getUserReactions } from "./getUserReactions";
import { getRoulettePartner } from "./db/getRoulettePartner";
import { buildInfoText } from "./sendForm";

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

    // Используем getRoulettePartner для поиска подходящего партнера с учетом сортировки
    const partnerId = await getRoulettePartner(ctx);

    if (partnerId) {
        // Связываем пользователей
        await prisma.rouletteUser.update({
            where: { id: userId },
            data: {
                chatPartnerId: partnerId,
                searchingPartner: false,
                usernameRevealed: false,
                profileRevealed: false
            }
        });

        await prisma.rouletteUser.update({
            where: { id: partnerId },
            data: {
                chatPartnerId: userId,
                searchingPartner: false,
                usernameRevealed: false,
                profileRevealed: false
            }
        });

        // Получаем данные пользователей для отображения информации
        const currentUser = await prisma.user.findUnique({ where: { id: userId } });
        const partnerUser = await prisma.user.findUnique({ where: { id: partnerId } });

        const reactionsMessagePartner = await getUserReactions(ctx, partnerId);

        let fullMessagePartner;
        
        // Добавляем информацию о пользователе в сообщение
        if (currentUser && partnerUser) {
            // Информация о текущем пользователе для партнера
            const partnerInfoText = buildInfoText(ctx, partnerUser, { myForm: false });
            
            if (reactionsMessagePartner) {
                fullMessagePartner = `${ctx.t('roulette_found')}\n\n${partnerInfoText}\n\n${reactionsMessagePartner}`;
            } else {
                fullMessagePartner = `${ctx.t('roulette_found')}\n\n${partnerInfoText}`;
            }
        } else {
            if (reactionsMessagePartner) {
                fullMessagePartner = `${ctx.t('roulette_found')}\n\n${reactionsMessagePartner}`;
            } else {
                fullMessagePartner = ctx.t('roulette_found');
            }
        }
        
        await ctx.reply(fullMessagePartner, {
            reply_markup: rouletteKeyboard(ctx.t)
        });

        const reactionsMessageYou = await getUserReactions(ctx, userId);

        let fullMessageYou;

        // Добавляем информацию о партнере в сообщение
        if (currentUser && partnerUser) {
            // Информация о партнере для текущего пользователя
            const userInfoText = buildInfoText(ctx, currentUser, { myForm: false });
            
            if (reactionsMessageYou) {
                fullMessageYou = `${ctx.t('roulette_found')}\n\n${userInfoText}\n\n${reactionsMessageYou}`;
            } else {
                fullMessageYou = `${ctx.t('roulette_found')}\n\n${userInfoText}`;
            }
        } else {
            if (reactionsMessageYou) {
                fullMessageYou = `${ctx.t('roulette_found')}\n\n${reactionsMessageYou}`;
            } else {
                fullMessageYou = ctx.t('roulette_found');
            }
        }
        
        await ctx.api.sendMessage(partnerId, fullMessageYou, {
            reply_markup: rouletteKeyboard(ctx.t)
        });
    } else {
        await ctx.reply(ctx.t('roulette_searching'), {
            reply_markup: rouletteStopKeyboard(ctx.t)
        });
    }
}
