import { createProfileTypeKeyboard, languageKeyboard } from '../constants/keyboards';
import { sendForm } from '../functions/sendForm';
import { MyContext } from '../typescript/context';

export async function startUsingBotStep(ctx: MyContext) {
    const userId = String(ctx.from!.id);
    ctx.logger.info({ userId, step: 'start_using_bot' }, 'User starting bot usage flow');

    if (ctx.session.privacyAccepted) {
        ctx.logger.info({ userId }, 'Privacy already accepted, proceeding to profile creation');
        ctx.session.step = "create_profile_type"
        ctx.session.isCreatingProfile = true;

        await ctx.reply(ctx.t('profile_type_title'), {
            reply_markup: createProfileTypeKeyboard(ctx.t)
        });
    } else {
        ctx.logger.info({ userId }, 'Privacy not accepted, redirecting to language selection');
        ctx.session.step = "choose_language_start";

        await ctx.reply(ctx.t('choose_language'), {
            reply_markup: languageKeyboard
        })
    }
} 