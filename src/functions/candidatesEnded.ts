import { profileKeyboard } from "../constants/keyboards"
import { MyContext } from "../typescript/context"

export const candidatesEnded = async (ctx: MyContext) => {
    const userId = String(ctx.from?.id);
    ctx.logger.info({ userId }, 'Candidates ended, returning to sleep menu');
    
    await ctx.reply(ctx.t('candidates_ended'))

    ctx.session.step = 'sleep_menu'
    await ctx.reply(ctx.t('sleep_menu'), {
        reply_markup: profileKeyboard()
    })
}   
