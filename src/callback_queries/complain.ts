import { complainKeyboard } from "../constants/keyboards";
import { MyContext } from "../typescript/context";

export const complainCallbackQuery = async (ctx: MyContext) => {
    const callbackQuery = ctx.callbackQuery!;
    const callbackData = callbackQuery.data!;

    const currentDate = new Date();
    const messageDate = new Date(callbackQuery.message?.date || 0);
    const messageAgeInSeconds = (currentDate.getTime() - messageDate.getTime()) / 1000;

    // Если сообщение старше 5 минут (300 секунд), считаем кнопку устаревшей
    const isObsoleteButton = messageAgeInSeconds > 300;
    // Если кнопка устаревшая, показываем уведомление с анимацией "палец вниз"

    if (isObsoleteButton) {
        await ctx.answerCallbackQuery({
            text: "👇",
            show_alert: false,
            cache_time: 86400
        });
    }

    const userId = callbackData.split(":")[1];

    ctx.session.additionalFormInfo.reportedUserId = userId;

    ctx.session.step = 'complain';

    await ctx.answerCallbackQuery();

    await ctx.reply(ctx.t('complain_text'), {
        reply_markup: complainKeyboard()
    });
}

