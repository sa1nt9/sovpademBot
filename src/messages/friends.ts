import { profileKeyboard } from '../constants/keyboards';
import { MyContext } from '../typescript/context';

export async function friendsStep(ctx: MyContext) {
    ctx.session.step = 'sleep_menu'

    await ctx.reply(ctx.t('sleep_menu'), {
        reply_markup: profileKeyboard()
    })
} 