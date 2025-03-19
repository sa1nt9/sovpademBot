import { disableFormKeyboard, profileKeyboard } from '../constants/keyboards';
import { sendForm } from '../functions/sendForm';
import { MyContext } from '../typescript/context';

export async function formDisabledStep(ctx: MyContext) {
    const message = ctx.message!.text;
    
    if (message === ctx.t("search_people")) {
        ctx.session.step = 'profile'

        await sendForm(ctx)
        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });

    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: disableFormKeyboard()
        });
    }
} 