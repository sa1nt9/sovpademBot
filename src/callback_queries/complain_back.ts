import { MyContext } from "../typescript/context";
import { rouletteReactionKeyboard } from "../constants/keyboards";
import { logger } from "../logger";

export const complainBackCallbackQuery = async (ctx: MyContext) => {
    const callbackQuery = ctx.callbackQuery!;
    const callbackData = callbackQuery.data!;
    const callbackParts = callbackData.split(":");
    const targetUserId = callbackParts[1];

    try {
        // Восстанавливаем оригинальное сообщение с реакциями
        if (ctx.callbackQuery?.message && ctx.session.originalReactionMessage) {
            await ctx.api.editMessageText(
                ctx.callbackQuery.message.chat.id,
                ctx.callbackQuery.message.message_id,
                ctx.session.originalReactionMessage.text,
                { 
                    reply_markup: rouletteReactionKeyboard(ctx.t, targetUserId)
                }
            );
        }

        logger.info({ userId: ctx.from?.id }, 'User returned from complaint');

        await ctx.answerCallbackQuery();
    } catch (error) {
        ctx.logger.error({
            error,
            action: 'Error handling complain back button',
            targetUserId
        });

        await ctx.answerCallbackQuery({
            text: ctx.t('error_occurred'),
            show_alert: true
        });
    }
} 