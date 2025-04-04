import { createProfileTypeKeyboard } from './../constants/keyboards';
import { acceptPrivacyKeyboard, ageKeyboard, profileKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { sendForm } from "../functions/sendForm";
import { MyContext } from "../typescript/context";

export const myprofileCommand = async (ctx: MyContext) => {
    const userId = String(ctx.message?.from.id);

    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (existingUser) {
        ctx.session.step = "profile";


        await sendForm(ctx)

        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else {
        if (ctx.session.privacyAccepted) {
            ctx.session.step = "create_profile_type"

            await ctx.reply(ctx.t('profile_type_title'), {
                reply_markup: createProfileTypeKeyboard(ctx.t)
            });
        } else {
            ctx.session.step = "accept_privacy";

            await ctx.reply(ctx.t('privacy_message'), {
                reply_markup: acceptPrivacyKeyboard(ctx.t),
            });
        }
    }
}