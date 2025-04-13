import { createProfileTypeKeyboard, formDisabledKeyboard, profileKeyboard } from '../constants/keyboards';
import { sendForm } from '../functions/sendForm';
import { MyContext } from '../typescript/context';

export async function formDisabledStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ userId, step: 'form_disabled' }, 'User accessing disabled form screen');

    if (message === ctx.t("create_new_profile")) {
        ctx.logger.info({ userId }, 'User choosing to create new profile after form disabled');
        ctx.session.step = "create_profile_type"
        ctx.session.isCreatingProfile = true;

        await ctx.reply(ctx.t('profile_type_title'), {
            reply_markup: createProfileTypeKeyboard(ctx.t)
        });
    } else if (message === ctx.t("main_menu")) {
        ctx.logger.info({ userId }, 'User returning to main menu from disabled form');
        ctx.session.step = "profile";

        await sendForm(ctx)

        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else {
        ctx.logger.warn({ userId, invalidOption: message }, 'User provided invalid response on disabled form screen');
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: formDisabledKeyboard(ctx.t)
        });
    }
} 