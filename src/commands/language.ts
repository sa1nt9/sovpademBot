import { languageKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { MyContext } from "../typescript/context";

export const languageCommand = async (ctx: MyContext) => {

    ctx.session.step = "choose_language";

    ctx.reply(ctx.t('choose_language'), {
        reply_markup: languageKeyboard
    })
}
