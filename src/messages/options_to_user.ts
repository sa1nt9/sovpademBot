import { getCandidate } from "../functions/db/getCandidate";
import { candidatesEnded } from "../functions/candidatesEnded";
import { MyContext } from "../typescript/context";
import { sendForm } from "../functions/sendForm";
import { answerFormKeyboard, complainKeyboard, optionsToUserKeyboard, profileKeyboard } from "../constants/keyboards";
import { sendMutualSympathyAfterAnswer } from "../functions/sendMutualSympathyAfterAnswer";
import { prisma } from "../db/postgres";
import { addToBlacklist } from "../functions/addToBlacklist";

export async function optionsToUserStep(ctx: MyContext) {
    const message = ctx.message!.text;
    
    if (message === '1. 🚫') {
        await addToBlacklist(ctx)
    } else if (message === '2. ⚠️') {
        ctx.session.step = "complain";

        await ctx.reply(ctx.t('complain_text'), {
            reply_markup: complainKeyboard()
        })
    } else if (message === '3. 💤') {
        ctx.session.step = 'sleep_menu'
        await ctx.reply(ctx.t('wait_somebody_to_see_your_form'))

        if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeUserId) {
            await sendMutualSympathyAfterAnswer(ctx)
            return
        }

        await ctx.reply(ctx.t('sleep_menu'), {
            reply_markup: profileKeyboard()
        })
    } else if (message === ctx.t("go_back")) {
        ctx.session.step = 'search_people';

        await ctx.reply("✨🔍", {
            reply_markup: answerFormKeyboard()
        });

        const candidate = await getCandidate(ctx)
        ctx.logger.info(candidate, 'This is new candidate')
        if (candidate) {
            await sendForm(ctx, candidate || null, { myForm: false })
        } else {
            await candidatesEnded(ctx)
        }
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: optionsToUserKeyboard(ctx.t)
        });
    }
}