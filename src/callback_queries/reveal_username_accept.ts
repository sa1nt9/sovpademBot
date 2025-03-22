import { complainKeyboard, rouletteKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { sendForm } from "../functions/sendForm";
import { MyContext } from "../typescript/context";

export const revealUsernameAcceptCallbackQuery = async (ctx: MyContext) => {
    const callbackQuery = ctx.callbackQuery!;
    const callbackData = callbackQuery.data!;

    const userId = callbackData.split(":")[1];
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
        where: { id: String(callbackQuery.from.id) },
        include: { rouletteUser: true }
    });

    const requestingUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { rouletteUser: true }
    });

    if (currentUser && requestingUser) {
        // Обновляем статус раскрытия имен пользователей для обоих пользователей
        if (currentUser.rouletteUser) {
            await prisma.rouletteUser.update({
                where: { id: currentUser.id },
                data: { usernameRevealed: true }
            });
        }

        if (requestingUser.rouletteUser) {
            await prisma.rouletteUser.update({
                where: { id: userId },
                data: { usernameRevealed: true }
            });
        }

        const userInfo = await ctx.api.getChat(requestingUser.id);

        const profileRevealed = currentUser.rouletteUser?.profileRevealed || false;
        const usernameRevealed = true;

        await ctx.reply(ctx.t('roulette_revealed_username') + `[${requestingUser.name}](https://t.me/${userInfo.username})`, {
            parse_mode: 'Markdown',
            reply_markup: rouletteKeyboard(ctx.t, profileRevealed, usernameRevealed)
        });

        await ctx.api.sendMessage(userId, ctx.t('roulette_revealed_username_by_partner') + `[${currentUser.name}](https://t.me/${callbackQuery.from?.username})`, {
            parse_mode: 'Markdown',
            reply_markup: rouletteKeyboard(ctx.t, profileRevealed, usernameRevealed)
        });
    }
}

