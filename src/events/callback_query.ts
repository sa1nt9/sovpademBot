import { complainCallbackQuery } from "../callback_queries/complain";
import { reactionCallbackQuery } from "../callback_queries/reaction";
import { revealAcceptCallbackQuery } from "../callback_queries/reveal_accept";
import { revealRejectCallbackQuery } from "../callback_queries/reveal_reject";
import { revealUsernameAcceptCallbackQuery } from "../callback_queries/reveal_username_accept";
import { revealUsernameRejectCallbackQuery } from "../callback_queries/reveal_username_reject";

import { MyContext } from "../typescript/context";

export const callbackQueryEvent = async (ctx: MyContext) => {
    const callbackQuery = ctx.callbackQuery!;
    const callbackData = callbackQuery.data;    

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
        }
    }
}