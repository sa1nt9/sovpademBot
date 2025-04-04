import { ProfileType } from "@prisma/client";
import { cityKeyboard, interestedInKeyboard } from "../../constants/keyboards";
import { MyContext } from "../../typescript/context";

export const interestedInQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;

    if (interestedInKeyboard(ctx.t)?.keyboard[0].includes(message || "")) {
        ctx.session.question = "city";
        ctx.session.activeProfile.interestedIn = message === ctx.t('men') ? 'male' : message === ctx.t('women') ? 'female' : "all";

        await ctx.reply(ctx.t('city_question'), {
            reply_markup: cityKeyboard(ctx.t, ctx.session)
        });
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: interestedInKeyboard(ctx.t)
        });
    }
} 