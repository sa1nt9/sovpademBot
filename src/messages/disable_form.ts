import { disableFormKeyboard } from './../constants/keyboards';
import { formDisabledKeyboard, profileKeyboard } from '../constants/keyboards';
import { MyContext } from '../typescript/context';

export async function disableFormStep(ctx: MyContext) {
    const message = ctx.message!.text;
    
    if (message === '1') {
        //await toggleUserActive(ctx, false)

        ctx.session.step = 'form_disabled'

        await ctx.reply(ctx.t('form_disabled_message'), {
            reply_markup: formDisabledKeyboard(ctx.t)
        });

    } else if (message === '2') {
        ctx.session.step = 'sleep_menu';

        await ctx.reply(ctx.t('sleep_menu'), {
            reply_markup: profileKeyboard()
        });

    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: disableFormKeyboard()
        });
    }
} 