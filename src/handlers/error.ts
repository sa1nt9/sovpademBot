import type { ErrorHandler } from 'grammy'
import { GrammyError, HttpError } from 'grammy';
import { MyContext } from '../typescript/context'

export const errorHandler: ErrorHandler<MyContext> = (error) => {
    const { ctx } = error;
    
    try {
        const userId = String(ctx.from?.id || 'unknown');
        const username = ctx.from?.username || 'unknown';

        // Специальная обработка ошибки блокировки бота пользователем
        if (error.error instanceof GrammyError && 
            (error.error.description === 'Forbidden: bot was blocked by the user' || 
             error.error.description === 'Forbidden: user is deactivated')) {
            ctx.logger.warn({
                error: 'Bot was blocked by user',
                user_id: userId,
                username,
                description: error.error.description,
                method: error.error.method,
                payload: error.error.payload
            }, 'User blocked the bot');
            
            // Не пытаемся отправлять сообщения пользователю, который заблокировал бота
            return;
        }

        // Обработка ошибок сети
        if (error.error instanceof HttpError) {
            ctx.logger.error({
                error: {
                    name: 'Network Error',
                    message: error.error.message,
                },
                user_id: userId,
                username
            }, 'Network error occurred');
            
            return;
        }

        const errorInfo = error.error instanceof Error ? {
            name: error.error.name,
            message: error.error.message,
            stack: error.error.stack,
        } : {
            name: 'Unknown Error',
            message: String(error.error),
            stack: undefined,
        };

        let updateType = 'unknown';
        try {
            updateType = ctx.update.message ? 'message' :
                ctx.update.callback_query ? 'callback_query' :
                ctx.update.inline_query ? 'inline_query' :
                ctx.update.my_chat_member ? 'my_chat_member' :
                'unknown';
        } catch (e) {
            // Если не удалось определить тип обновления, оставляем значение по умолчанию
        }

        ctx.logger.error({
            error: errorInfo,
            update: {
                update_id: ctx.update?.update_id,
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
    } catch (e) {
        // Последний рубеж защиты - даже если произошла ошибка при обработке ошибки,
        // мы все равно перехватываем её и не даем приложению упасть
        console.error('Critical error in error handler:', e);
        console.error('Original error:', error.error);
    }
    
    // Важно! Всегда возвращаем управление, чтобы бот продолжал работу
    return;
};
