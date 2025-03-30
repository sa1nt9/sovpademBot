import { allRightKeyboard, answerFormKeyboard, profileKeyboard } from "../../constants/keyboards";
import { MyContext } from "../../typescript/context";
import { getCandidate } from "../../functions/db/getCandidate";
import { sendForm } from "../../functions/sendForm";
import { candidatesEnded } from "../../functions/candidatesEnded";

export const allRightQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    
    if (message === ctx.t("yes")) {
        ctx.logger.info('yes')
        ctx.session.step = 'search_people'
        ctx.session.question = 'years'

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

    } else if (message === ctx.t('change_form')) {
        ctx.logger.info('change_form')
        ctx.session.step = 'profile'

        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });

    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: allRightKeyboard(ctx.t)
        });
    }
} 