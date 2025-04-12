import { rouletteKeyboard, rouletteStopKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { MyContext } from "../typescript/context";
import { getUserReactions } from "./getUserReactions";
import { getRoulettePartner } from "./db/getRoulettePartner";
import { buildInfoText } from "./sendForm";
import { ISessionData } from "../typescript/interfaces/ISessionData";
import { i18n } from "../i18n";
export const findRouletteUser = async (ctx: MyContext) => {
    const userId = String(ctx.message?.from.id);

    ctx.logger.info({ userId }, 'Starting roulette user search');

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

    ctx.logger.info({ userId }, 'User marked as searching partner');

    // Используем getRoulettePartner для поиска подходящего партнера с учетом сортировки
    const partnerId = await getRoulettePartner(ctx);

    if (partnerId) {
        ctx.logger.info({ userId, partnerId }, 'Found roulette partner');

        // Создаем новый чат в рулетке
        await prisma.rouletteChat.create({
            data: {
                user1Id: userId,
                user2Id: partnerId,
                startedAt: new Date(),
                isProfileRevealed: false,
                isUsernameRevealed: false
            }
        });

        ctx.logger.info({ userId, partnerId }, 'Created roulette chat');

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

        ctx.logger.info({ userId, partnerId }, 'Updated both users roulette status');

        // Получаем данные пользователей для отображения информации
        const currentUser = await prisma.user.findUnique({ where: { id: userId } });
        const partnerUser = await prisma.user.findUnique({ where: { id: partnerId } });

        const reactionsMessagePartner = await getUserReactions(ctx, partnerId, { showTitle: true });

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

        const reactionsMessageYou = await getUserReactions(ctx, userId, { showTitle: true });

        let fullMessageYou;

        const currentSession = await prisma.session.findUnique({
            where: {
                key: userId
            }
        });

        const { __language_code } = currentSession ? JSON.parse(currentSession.value as string) as ISessionData : {} as ISessionData;
        const i18nInstance = i18n(false);
        
        // Добавляем информацию о партнере в сообщение
        if (currentUser && partnerUser) {
            // Информация о партнере для текущего пользователя
            const userInfoText = buildInfoText(ctx, currentUser, { myForm: false });
            
            if (reactionsMessageYou) {
                fullMessageYou = `${i18nInstance.t(__language_code || "ru", 'roulette_found')}\n\n${userInfoText}\n\n${reactionsMessageYou}`;
            } else {
                fullMessageYou = `${i18nInstance.t(__language_code || "ru", 'roulette_found')}\n\n${userInfoText}`;
            }
        } else {
            if (reactionsMessageYou) {
                fullMessageYou = `${i18nInstance.t(__language_code || "ru", 'roulette_found')}\n\n${reactionsMessageYou}`;
            } else {
                fullMessageYou = `${i18nInstance.t(__language_code || "ru", 'roulette_found')}`;
            }
        }
        
        await ctx.api.sendMessage(partnerId, fullMessageYou, {
            reply_markup: rouletteKeyboard(ctx.t)
        });

        ctx.logger.info({ userId, partnerId }, 'Sent roulette messages to both users');
    } else {
        ctx.logger.info({ userId }, 'No partner found, continuing search');
        await ctx.reply(ctx.t('roulette_searching'), {
            reply_markup: rouletteStopKeyboard(ctx.t)
        });
    }
}
