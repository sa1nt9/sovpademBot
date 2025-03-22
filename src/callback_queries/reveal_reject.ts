import { MyContext } from "../typescript/context";

export const revealRejectCallbackQuery = async (ctx: MyContext) => {
    const callbackQuery = ctx.callbackQuery!;
    const callbackData = callbackQuery.data!;

    const userId = callbackData.split(":")[1];
    await ctx.answerCallbackQuery({
        text: ctx.t('roulette_reveal_rejected'),
        show_alert: false
    });

    // Изменяем текст и удаляем клавиатуру
    if (callbackQuery.message) {
        await ctx.api.editMessageText(
            callbackQuery.message.chat.id,
            callbackQuery.message.message_id,
            ctx.t('roulette_reveal_rejected'),
            { reply_markup: { inline_keyboard: [] } }
        );
    }

    await ctx.api.sendMessage(userId, ctx.t('roulette_reveal_rejected_message'));
}

