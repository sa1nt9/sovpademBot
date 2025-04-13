import { profileKeyboard } from '../constants/keyboards';
import { MyContext } from '../typescript/context';

export async function friendsStep(ctx: MyContext) {
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ userId, step: 'friends' }, 'User leaving friend referral screen');
    
    ctx.session.step = 'sleep_menu'

    await ctx.reply(ctx.t('sleep_menu'), {
        reply_markup: profileKeyboard()
    })
} 