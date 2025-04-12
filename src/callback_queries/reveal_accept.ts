import { complainKeyboard, rouletteKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { sendForm } from "../functions/sendForm";
import { i18n } from "../i18n";
import { MyContext } from "../typescript/context";
import { ISessionData } from "../typescript/interfaces/ISessionData";

export const revealAcceptCallbackQuery = async (ctx: MyContext) => {
    const callbackQuery = ctx.callbackQuery!;
    const callbackData = callbackQuery.data!;

    const userId = callbackData.split(":")[1];
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
        where: { id: String(callbackQuery.from.id) },
        include: { rouletteUser: true }
    });

    const requestingUser = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (currentUser && requestingUser) {
        // Обновляем статус раскрытия профилей для обоих пользователей
        if (currentUser.rouletteUser) {
            await prisma.rouletteUser.update({
                where: { id: currentUser.id },
                data: { profileRevealed: true }
            });
        }

        await prisma.rouletteUser.update({
            where: { id: userId },
            data: { profileRevealed: true }
        });

        const profileRevealed = true;
        const usernameRevealed = currentUser.rouletteUser?.usernameRevealed || false;

        await ctx.reply(ctx.t('roulette_revealed'), {
            reply_markup: rouletteKeyboard(ctx.t, profileRevealed, usernameRevealed)
        });
        await sendForm(ctx, requestingUser, { myForm: false });

        const currentSession = await prisma.session.findUnique({
            where: {
                key: userId
            }
        });

        const { __language_code } = currentSession ? JSON.parse(currentSession.value as string) as ISessionData : {} as ISessionData;

        await ctx.api.sendMessage(userId, i18n(false).t(__language_code || "ru", 'roulette_your_profile_revealed'));
        await ctx.api.sendMessage(userId, i18n(false).t(__language_code || "ru", 'roulette_revealed'), {
            reply_markup: rouletteKeyboard(ctx.t, profileRevealed, usernameRevealed)
        });
        await sendForm(ctx, currentUser, { myForm: false, sendTo: userId });
    }
}

