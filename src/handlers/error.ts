import type { ErrorHandler } from 'grammy'
import { MyContext } from '../typescript/context'

export const errorHandler: ErrorHandler<MyContext> = (error) => {
    const { ctx } = error;
    const userId = String(ctx.from?.id);
    const username = ctx.from?.username;

    const errorInfo = error.error instanceof Error ? {
        name: error.error.name,
        message: error.error.message,
        stack: error.error.stack,
    } : {
        name: 'Unknown Error',
        message: String(error.error),
        stack: undefined,
    };

    const updateType = ctx.update.message ? 'message' :
        ctx.update.callback_query ? 'callback_query' :
        ctx.update.inline_query ? 'inline_query' :
        'unknown';

    ctx.logger.error({
        error: errorInfo,
        update: {
            update_id: ctx.update.update_id,
            update_type: updateType,
            chat_id: ctx.chat?.id,
            message_id: ctx.message?.message_id,
            callback_query_id: ctx.callbackQuery?.id,
            inline_query_id: ctx.inlineQuery?.id,
        },
        user: {
            id: userId,
            username,
            language_code: ctx.from?.language_code,
        },
        session: {
            step: ctx.session?.step,
            activeProfile: ctx.session?.activeProfile?.id,
        },
    }, 'Error occurred during update processing');
};
