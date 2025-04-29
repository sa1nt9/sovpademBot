import { Middleware } from "grammy";
import { MyContext } from "../typescript/context";

export const errorMiddleware: Middleware<MyContext> = async (ctx, next) => {
    try {
        await next();
    } catch (error) {
        // Логируем ошибку
        ctx.logger.error({
            error,
            userId: ctx.from?.id,
            username: ctx.from?.username,
            update: ctx.update
        }, 'Error in middleware');

        return;
    }
}; 