import { languageKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { MyContext } from "../typescript/context";

export const languageCommand = async (ctx: MyContext) => {
    const userId = String(ctx.message?.from.id);

    ctx.logger.info({ userId }, 'Starting language command');

    ctx.session.step = "choose_language";

    ctx.logger.info({ userId, step: ctx.session.step }, 'Showing language selection menu');

    ctx.reply(ctx.t('choose_language'), {
        reply_markup: languageKeyboard
    });
}
