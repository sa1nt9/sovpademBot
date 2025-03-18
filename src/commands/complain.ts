import { complainKeyboard, goBackKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { MyContext } from "../typescript/context";

export const complainCommand = async (ctx: MyContext) => {
    const userId = String(ctx.message?.from.id);

    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });
    
    if (existingUser && ctx.session.currentCandidate && (ctx.session.step === "search_people" || ctx.session.step === "search_people_with_likes")) {
        ctx.session.step = "complain";

        await ctx.reply(ctx.t('complain_text'), {
            reply_markup: complainKeyboard()
        })
    } else {
        ctx.session.step = "cannot_send_complain";

        await ctx.reply(ctx.t('complain_can_be_sended_only_while_searching'), {
            reply_markup: goBackKeyboard(ctx.t, true)
        })
    }
}