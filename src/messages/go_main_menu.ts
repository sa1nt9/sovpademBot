import { answerFormKeyboard, mainMenuKeyboard, profileKeyboard } from '../constants/keyboards';
import { sendForm } from '../functions/sendForm';
import { MyContext } from '../typescript/context';

export async function goMainMenuStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ userId, step: 'go_main_menu', message }, 'User attempting to return to main menu');
    
    if (message === ctx.t("main_menu")) {
        ctx.logger.info({ userId }, 'User returned to main menu');
        ctx.session.step = "profile";

        await sendForm(ctx)

        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else {
        ctx.logger.warn({ userId, invalidOption: message }, 'User provided invalid response in main menu navigation');
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: mainMenuKeyboard(ctx.t)
        });
    }
} 