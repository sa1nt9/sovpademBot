import { complainKeyboard, rouletteKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { sendForm } from "../functions/sendForm";
import { i18n } from "../i18n";
import { MyContext } from "../typescript/context";
import { ISessionData } from "../typescript/interfaces/ISessionData";
import { logger } from "../logger";

export const revealAcceptCallbackQuery = async (ctx: MyContext) => {
    const callbackQuery = ctx.callbackQuery!;
    const callbackData = callbackQuery.data!;
    const currentUserId = String(callbackQuery.from.id);
    const requestingUserId = callbackData.split(":")[1];
    
    ctx.logger.info({
        currentUserId,
        requestingUserId,
        callbackType: 'reveal_accept',
        action: 'profile_reveal'
    }, 'User accepted profile reveal request');

    await ctx.answerCallbackQuery({
        text: ctx.t('roulette_reveal_accepted'),
        show_alert: false
    });

    // Изменяем текст и удаляем клавиатуру
    if (callbackQuery.message) {
        await ctx.api.editMessageText(
            callbackQuery.message.chat.id,
            callbackQuery.message.message_id,
            ctx.t('roulette_reveal_accepted'),
            { reply_markup: { inline_keyboard: [] } }
        );
    }

    // Получаем информацию о пользователях
    const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        include: { rouletteUser: true }
    });

    const requestingUser = await prisma.user.findUnique({
        where: { id: requestingUserId }
    });

    if (currentUser && requestingUser) {
        ctx.logger.info({
            currentUserId,
            requestingUserId,
            currentUserName: currentUser.name,
            requestingUserName: requestingUser.name
        }, 'Both users found for profile reveal');
        
        // Обновляем статус раскрытия профилей для обоих пользователей
        if (currentUser.rouletteUser) {
            await prisma.rouletteUser.update({
                where: { id: currentUserId },
                data: { profileRevealed: true }
            });
            
            ctx.logger.debug({
                userId: currentUserId,
                rouletteUserId: currentUser.rouletteUser.id
            }, 'Updated profile revealed status for current user');
        }

        await prisma.rouletteUser.update({
            where: { id: requestingUserId },
            data: { profileRevealed: true }
        });
        
        ctx.logger.debug({
            userId: requestingUserId
        }, 'Updated profile revealed status for requesting user');

        const profileRevealed = true;
        const usernameRevealed = currentUser.rouletteUser?.usernameRevealed || false;

        await ctx.reply(ctx.t('roulette_revealed'), {
            reply_markup: rouletteKeyboard(ctx.t, profileRevealed, usernameRevealed)
        });
        await sendForm(ctx, requestingUser, { myForm: false });

        const currentSession = await prisma.session.findUnique({
            where: {
                key: requestingUserId
            }
        });

        const { __language_code } = currentSession ? JSON.parse(currentSession.value as string) as ISessionData : {} as ISessionData;

        ctx.logger.info({
            currentUserId,
            requestingUserId,
            profileRevealed,
            usernameRevealed,
            language: __language_code || "ru"
        }, 'Sending mutual profile reveal notifications');

        await ctx.api.sendMessage(requestingUserId, i18n(false).t(__language_code || "ru", 'roulette_your_profile_revealed'));
        await ctx.api.sendMessage(requestingUserId, i18n(false).t(__language_code || "ru", 'roulette_revealed'), {
            reply_markup: rouletteKeyboard(ctx.t, profileRevealed, usernameRevealed)
        });
        await sendForm(ctx, currentUser, { myForm: false, sendTo: requestingUserId });
    } else {
        ctx.logger.warn({
            currentUserId,
            requestingUserId,
            currentUserFound: !!currentUser,
            requestingUserFound: !!requestingUser
        }, 'Could not find one or both users for profile reveal');
    }
}

