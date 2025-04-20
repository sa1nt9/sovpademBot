import { deactivateProfileKeyboard, notHaveFormToDeactiveKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { getUserProfiles } from "../functions/db/profilesService";
import { MyContext } from "../typescript/context";

export const deactivateCommand = async (ctx: MyContext) => {
    const userId = String(ctx.from?.id);

    ctx.logger.info({ userId }, 'Starting deactivate command');

    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (existingUser) {
        ctx.session.step = 'disable_form';
        ctx.logger.info({ userId }, 'Getting user profiles for deactivation');

        const profiles = await getUserProfiles(userId, ctx);

        await ctx.reply(ctx.t('are_you_sure_you_want_to_disable_your_form'), {
            reply_markup: deactivateProfileKeyboard(ctx.t, profiles)
        });
    } else {
        ctx.session.step = "you_dont_have_form";
        ctx.logger.warn({ userId }, 'User tried to deactivate without profile');

        await ctx.reply(ctx.t('you_dont_have_form'), {
            reply_markup: notHaveFormToDeactiveKeyboard(ctx.t)
        });
    }
}