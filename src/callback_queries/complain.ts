import { complainKeyboard } from "../constants/keyboards";
import { MyContext } from "../typescript/context";
import { logger } from "../logger";

export const complainCallbackQuery = async (ctx: MyContext) => {
    logger.info({ userId: ctx.from?.id }, 'User initiated complaint');
    
    const callbackQuery = ctx.callbackQuery!;
    const callbackData = callbackQuery.data!;

    await ctx.answerCallbackQuery({
        text: "👇",
        show_alert: false,
        cache_time: 86400
    });

    const userId = callbackData.split(":")[1];

    ctx.session.additionalFormInfo.reportedUserId = userId;

    ctx.session.step = 'complain';

    await ctx.answerCallbackQuery();

    await ctx.reply(ctx.t('complain_text'), {
        reply_markup: complainKeyboard()
    });
}

