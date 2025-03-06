import type { ErrorHandler } from 'grammy'
import { MyContext } from '../typescript/context'

export const errorHandler: ErrorHandler<MyContext> = (error) => {
    const { ctx } = error

    ctx.logger.error({
        err: error.error,
        update: ctx.update,
    })
}
