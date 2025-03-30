import { genderKeyboard } from "../../constants/keyboards";
import { ageKeyboard } from "../../constants/keyboards";
import { MyContext } from "../../typescript/context";

export const yearsQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;

    const n = Number(message)
    if (!/^\d+$/.test(message || "str")) {
        await ctx.reply(ctx.t('type_years'), {
            reply_markup: ageKeyboard(ctx.session)
        });
    } else if (n <= 8) {
        await ctx.reply(ctx.t('type_bigger_year'), {
            reply_markup: ageKeyboard(ctx.session)
        });
    } else if (n > 100) {
        await ctx.reply(ctx.t('type_smaller_year'), {
            reply_markup: ageKeyboard(ctx.session)
        });
    } else {
        ctx.session.activeProfile.age = n;
        ctx.session.question = "gender";

        await ctx.reply(ctx.t('gender_question'), {
            reply_markup: genderKeyboard(ctx.t)
        });
    }
}
