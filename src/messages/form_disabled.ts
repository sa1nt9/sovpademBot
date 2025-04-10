import { ProfileType } from '@prisma/client';
import { answerFormKeyboard, createProfileTypeKeyboard, deactivateProfileKeyboard, formDisabledKeyboard, profileKeyboard } from '../constants/keyboards';
import { candidatesEnded } from '../functions/candidatesEnded';
import { getCandidate } from '../functions/db/getCandidate';
import { toggleProfileActive } from '../functions/db/profilesService';
import { sendForm } from '../functions/sendForm';
import { MyContext } from '../typescript/context';

export async function formDisabledStep(ctx: MyContext) {
    const message = ctx.message!.text;

    if (message === ctx.t("create_new_profile")) {
        ctx.session.step = "create_profile_type"

        await ctx.reply(ctx.t('profile_type_title'), {
            reply_markup: createProfileTypeKeyboard(ctx.t)
        });
    } else if (message === ctx.t("main_menu")) {
        ctx.session.step = "profile";

        await sendForm(ctx)

        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: formDisabledKeyboard(ctx.t)
        });
    }
} 