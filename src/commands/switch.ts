import { createFormKeyboard, createProfileTypeKeyboard, languageKeyboard, mainMenuKeyboard, profileKeyboard, switchProfileKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { getUserProfiles } from "../functions/db/profilesService";
import { MyContext } from "../typescript/context";

export const switchCommand = async (ctx: MyContext) => {
    const userId = String(ctx.from?.id);

    ctx.logger.info({ userId }, 'Starting switch command');

    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (existingUser) {
        ctx.logger.info({ userId }, 'Getting user profiles for switching');
        ctx.session.step = "switch_profile";

        const profiles = await getUserProfiles(userId, ctx);

        await ctx.reply(ctx.t('switch_profile_message'), {
            reply_markup: switchProfileKeyboard(ctx.t, profiles)
        });
    } else {
        ctx.logger.info({ userId }, 'No existing user, showing profile type selection');
        ctx.session.step = "create_profile_type"
        ctx.session.isCreatingProfile = true;

        await ctx.reply(ctx.t('profile_type_title'), {
            reply_markup: createProfileTypeKeyboard(ctx.t)
        });
    }
}