import { prisma } from "../db/postgres";
import { i18n } from "../i18n";
import { MyContext } from "../typescript/context";
import { ISessionData } from "../typescript/interfaces/ISessionData";

export const revealUsernameRejectCallbackQuery = async (ctx: MyContext) => {
    const callbackQuery = ctx.callbackQuery!;
    const callbackData = callbackQuery.data!;

    const userId = callbackData.split(":")[1];
    await ctx.answerCallbackQuery({
        text: ctx.t('roulette_reveal_username_rejected'),
        show_alert: false
    });

    // Изменяем текст и удаляем клавиатуру
    if (callbackQuery.message) {
        await ctx.api.editMessageText(
            callbackQuery.message.chat.id,
            callbackQuery.message.message_id,
            ctx.t('roulette_reveal_username_rejected'),
            { reply_markup: { inline_keyboard: [] } }
        );
    }

    // Уведомляем запросившего пользователя об отказе
    const currentSession = await prisma.session.findUnique({
        where: {
            key: userId
        }
    });

    const { __language_code } = currentSession ? JSON.parse(currentSession.value as string) as ISessionData : {} as ISessionData;
    await ctx.api.sendMessage(userId, i18n(false).t(__language_code || "ru", 'roulette_reveal_rejected_message'));
}

