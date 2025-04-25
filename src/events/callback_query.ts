import { complainCallbackQuery } from "../callback_queries/complain";
import { complainBackCallbackQuery } from "../callback_queries/complain_back";
import { complainReasonCallbackQuery } from "../callback_queries/complain_reason";
import { reactionCallbackQuery } from "../callback_queries/reaction";
import { revealAcceptCallbackQuery } from "../callback_queries/reveal_accept";
import { revealRejectCallbackQuery } from "../callback_queries/reveal_reject";
import { revealUsernameAcceptCallbackQuery } from "../callback_queries/reveal_username_accept";
import { revealUsernameRejectCallbackQuery } from "../callback_queries/reveal_username_reject";
import { matchCallbackQuery } from "../callback_queries/match";

import { MyContext } from "../typescript/context";

export const callbackQueryEvent = async (ctx: MyContext) => {
    try {
        const callbackQuery = ctx.callbackQuery!;
        const callbackData = callbackQuery.data;    

        ctx.logger.info({ 
            userId: ctx.from?.id,
            username: ctx.from?.username,
            callbackData: callbackData,
            messageId: callbackQuery.message?.message_id
        }, 'Processing callback query');

        if (callbackData) {
            if (callbackData.startsWith("complain:")) {
                await complainCallbackQuery(ctx)
            } else if (callbackData.startsWith("reveal_accept:")) {
                await revealAcceptCallbackQuery(ctx)
            } else if (callbackData.startsWith("reveal_reject:")) {
                await revealRejectCallbackQuery(ctx)    
            } else if (callbackData.startsWith("reveal_username_accept:")) {
                await revealUsernameAcceptCallbackQuery(ctx)
            } else if (callbackData.startsWith("reveal_username_reject:")) {
                await revealUsernameRejectCallbackQuery(ctx)
            } else if (callbackData.startsWith("reaction:")) {
                await reactionCallbackQuery(ctx)
            } else if (callbackData.startsWith("complain_reason:")) {
                await complainReasonCallbackQuery(ctx)
            } else if (callbackData.startsWith("complain_back:")) {
                await complainBackCallbackQuery(ctx)
            } else if (callbackData.startsWith("match:")) {
                await matchCallbackQuery(ctx)
            } else {
                ctx.logger.warn({ 
                    userId: ctx.from?.id,
                    callbackData: callbackData 
                }, 'Unknown callback query type');
            }
        }
    } catch (error) {
        ctx.logger.error({ 
            userId: ctx.from?.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            callbackData: ctx.callbackQuery?.data
        }, 'Error in callback query handler');
    }
}