import { createFormKeyboard, createProfileTypeKeyboard, languageKeyboard, mainMenuKeyboard, profileKeyboard, switchProfileKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { getUserProfiles } from "../functions/db/profilesService";
import { decodeId } from "../functions/encodeId";
import { sendForm } from "../functions/sendForm";
import { MyContext } from "../typescript/context";

export const switchCommand = async (ctx: MyContext) => {
    const userId = String(ctx.message?.from.id);

    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    ctx.logger.info({
        msg: 'switch',
        existingUser: existingUser
    })

    if (existingUser) {
        ctx.session.step = "switch_profile";

        const profiles = await getUserProfiles(userId, ctx);

        await ctx.reply(ctx.t('switch_profile_message'), {
            reply_markup: switchProfileKeyboard(ctx.t, profiles)
        });
    } else {
        ctx.session.step = "create_profile_type"

        await ctx.reply(ctx.t('profile_type_title'), {
            reply_markup: createProfileTypeKeyboard(ctx.t)
        });
    }
}