import { complainKeyboard, rouletteKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { sendForm } from "../functions/sendForm";
import { i18n } from "../i18n";
import { MyContext } from "../typescript/context";
import { ISessionData } from "../typescript/interfaces/ISessionData";
import { logger } from "../logger";

export const revealUsernameAcceptCallbackQuery = async (ctx: MyContext) => {
    const callbackQuery = ctx.callbackQuery!;
    const callbackData = callbackQuery.data!;
    const currentUserId = String(callbackQuery.from.id);
    const requestingUserId = callbackData.split(":")[1];
    
    ctx.logger.info({
        currentUserId,
        requestingUserId,
        callbackType: 'reveal_username_accept',
        action: 'username_reveal'
    }, 'User accepted username reveal request');

    await ctx.answerCallbackQuery({
        text: ctx.t('roulette_reveal_username_accepted'),
        show_alert: false
    });

    // Удаляем клавиатуру или изменяем на неактивную
    if (callbackQuery.message) {
        await ctx.api.editMessageText(
            callbackQuery.message.chat.id,
            callbackQuery.message.message_id,
            ctx.t('roulette_reveal_username_accepted'),
            { reply_markup: { inline_keyboard: [] } }
        );
    }

    // Получаем информацию о пользователях
    const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        include: { rouletteUser: true }
    });

    const requestingUser = await prisma.user.findUnique({
        where: { id: requestingUserId },
        include: { rouletteUser: true }
    });

    if (currentUser && requestingUser) {
        ctx.logger.info({
            currentUserId,
            requestingUserId,
            currentUserName: currentUser.name,
            requestingUserName: requestingUser.name,
            currentUserUsername: callbackQuery.from?.username,
            requestingUserHasRouletteData: !!requestingUser.rouletteUser
        }, 'Both users found for username reveal');
        
        // Обновляем статус раскрытия имен пользователей для обоих пользователей
        if (currentUser.rouletteUser) {
            await prisma.rouletteUser.update({
                where: { id: currentUserId },
                data: { usernameRevealed: true }
            });
            
            ctx.logger.debug({
                userId: currentUserId
            }, 'Updated username revealed status for current user');
        }

        if (requestingUser.rouletteUser) {
            await prisma.rouletteUser.update({
                where: { id: requestingUserId },
                data: { usernameRevealed: true }
            });
            
            ctx.logger.debug({
                userId: requestingUserId
            }, 'Updated username revealed status for requesting user');
        }

        const userInfo = await ctx.api.getChat(requestingUserId);
        ctx.logger.debug({
            requestingUserId,
            username: userInfo.username
        }, 'Retrieved requesting user info');

        const profileRevealed = currentUser.rouletteUser?.profileRevealed || false;
        const usernameRevealed = true;

        ctx.logger.info({
            currentUserId,
            requestingUserId,
            requestingUserUsername: userInfo.username,
            currentUserUsername: callbackQuery.from?.username,
            profileRevealed
        }, 'Usernames revealed for both users');

        await ctx.reply(ctx.t('roulette_revealed_username') + `[${requestingUser.name}](https://t.me/${userInfo.username})`, {
            parse_mode: 'Markdown',
            reply_markup: rouletteKeyboard(ctx.t, profileRevealed, usernameRevealed),
            link_preview_options: {
                is_disabled: true
            },
        });

        const currentSession = await prisma.session.findUnique({
            where: {
                key: requestingUserId
            }
        });
    
        const { __language_code } = currentSession ? JSON.parse(currentSession.value as string) as ISessionData : {} as ISessionData;
        
        ctx.logger.info({
            currentUserId,
            requestingUserId,
            language: __language_code || "ru"
        }, 'Sending username reveal notification to requesting user');
        
        await ctx.api.sendMessage(requestingUserId, i18n(false).t(__language_code || "ru", 'roulette_revealed_username_by_partner') + `[${currentUser.name}](https://t.me/${callbackQuery.from?.username})`, {
            parse_mode: 'Markdown',
            reply_markup: rouletteKeyboard(ctx.t, profileRevealed, usernameRevealed),
            link_preview_options: {
                is_disabled: true
            },
        });
    } else {
        ctx.logger.warn({
            currentUserId,
            requestingUserId,
            currentUserFound: !!currentUser,
            requestingUserFound: !!requestingUser
        }, 'Could not find one or both users for username reveal');
    }
}

