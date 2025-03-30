import { nameKeyboard, textKeyboard } from "../../constants/keyboards";
import { MyContext } from "../../typescript/context";

export const nameQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    
    if (!message) {
        await ctx.reply(ctx.t('type_name'), {
            reply_markup: nameKeyboard(ctx.session)
        });
    } else if (message.length > 100) {
        await ctx.reply(ctx.t('long_name'), {
            reply_markup: nameKeyboard(ctx.session)
        });
    } else {
        ctx.session.question = "text";
        if (ctx.session.activeProfile.name) {
            ctx.session.activeProfile.previousName = ctx.session.activeProfile.name
        }
        ctx.session.activeProfile.name = message

        await ctx.reply(ctx.t('text_question'), {
            reply_markup: textKeyboard(ctx.t, ctx.session)
        });
    }
} 