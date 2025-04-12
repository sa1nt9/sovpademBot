import { answerLikesFormKeyboard, createProfileTypeKeyboard, notHaveFormToDeactiveKeyboard, profileKeyboard } from './../constants/keyboards';
import { prisma } from "../db/postgres";
import { MyContext } from "../typescript/context";
import { getOneLike } from '../functions/db/getOneLike';
import { sendForm } from '../functions/sendForm';

export const newLikesCommand = async (ctx: MyContext) => {
    const userId = String(ctx.message?.from.id);

    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (existingUser) {
        const oneLike = await getOneLike(userId, 'user');

        if (oneLike) {
            ctx.session.step = 'search_people_with_likes'
            ctx.session.additionalFormInfo.searchingLikes = true


            ctx.session.currentCandidateProfile = oneLike?.fromProfile

            await ctx.reply("✨🔍", {
                reply_markup: answerLikesFormKeyboard()
            });

            if (oneLike?.fromProfile) {
                await sendForm(ctx, oneLike.fromProfile.user, { myForm: false, like: oneLike });
            }
        } else {
            await ctx.reply(ctx.t('no_new_likes'), {
                reply_markup: notHaveFormToDeactiveKeyboard(ctx.t)
            })

            ctx.session.step = 'sleep_menu'
            await ctx.reply(ctx.t('sleep_menu'), {
                reply_markup: profileKeyboard()
            })
        }
    } else {
        ctx.session.step = "you_dont_have_form";

        await ctx.reply(ctx.t('you_dont_have_form'), {
            reply_markup: notHaveFormToDeactiveKeyboard(ctx.t)
        })
    }
}