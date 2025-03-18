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
            ctx.session.step = "questions";
            ctx.session.question = 'years'

            await ctx.reply(ctx.t('years_question'), {
                reply_markup: ageKeyboard(ctx.session)
            });
        } else {
            ctx.session.step = "accept_privacy";

            await ctx.reply(ctx.t('privacy_message'), {
                reply_markup: acceptPrivacyKeyboard(ctx.t),
            });
        }
    }
}