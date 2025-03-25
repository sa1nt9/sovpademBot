import { profileKeyboard } from "../constants/keyboards"
import { MyContext } from "../typescript/context"

export const candidatesEnded = async (ctx: MyContext) => {
    await ctx.reply(ctx.t('candidates_ended'))

    ctx.session.step = 'sleep_menu'
    await ctx.reply(ctx.t('sleep_menu'), {
        reply_markup: profileKeyboard()
    })
}   
