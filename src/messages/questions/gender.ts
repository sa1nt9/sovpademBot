import { genderKeyboard, interestedInKeyboard } from "../../constants/keyboards";
import { MyContext } from "../../typescript/context";

export const genderQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    
    if (genderKeyboard(ctx.t)?.keyboard[0].includes(message || "")) {
        ctx.session.question = "interested_in";
        ctx.session.activeProfile.gender = message === ctx.t('i_man') ? 'male' : 'female';

        await ctx.reply(ctx.t('interested_in_question'), {
            reply_markup: interestedInKeyboard(ctx.t)
        });
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: genderKeyboard(ctx.t)
        });
    }
} 