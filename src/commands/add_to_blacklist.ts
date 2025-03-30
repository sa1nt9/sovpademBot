import { complainKeyboard, goBackKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { MyContext } from "../typescript/context";
import { addToBlacklist } from "../functions/addToBlacklist";


export const addToBlacklistCommand = async (ctx: MyContext) => {
    const userId = String(ctx.message?.from.id);

    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });
    
    if (existingUser && ctx.session.currentCandidateProfile && (ctx.session.step === "search_people" || ctx.session.step === "search_people_with_likes" || ctx.session.step === "options_to_user")) {
        await addToBlacklist(ctx)
    } else {
        ctx.session.step = "cannot_send_complain";

        await ctx.reply(ctx.t('can_add_to_blacklist_only_while_searching'), {
            reply_markup: goBackKeyboard(ctx.t, true)
        })
    }
}