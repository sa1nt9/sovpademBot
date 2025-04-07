import { blacklistKeyboard, goBackKeyboard, profileKeyboard, skipKeyboard, textOrVideoKeyboard } from '../constants/keyboards';
import { prisma } from '../db/postgres';
import { getNextBlacklistProfile } from '../functions/db/getNextBlacklistProfile';
import { sendForm } from '../functions/sendForm';
import { MyContext } from '../typescript/context';

export async function blacklistUserStep(ctx: MyContext) {
    const message = ctx.message!.text;

    if (message === ctx.t('main_menu')) {
        ctx.session.step = "profile";


        await sendForm(ctx)

        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else if (message === ctx.t("see_next")) {
        if (!ctx.session.currentBlacklistedProfile) {
            await ctx.reply(ctx.t("error_occurred"));
            return;
        }
        const nextProfile = await getNextBlacklistProfile(ctx, ctx.session.currentBlacklistedProfile.id)

        if (nextProfile.profile) {
            ctx.session.currentBlacklistedProfile = nextProfile.profile

            await sendForm(ctx, nextProfile.profile.user, {
                myForm: false,
                isBlacklist: true,
                blacklistCount: nextProfile.remainingCount
            })
        } else {
            await ctx.reply(ctx.t('blacklist_no_more_users'))
            ctx.session.step = "sleep_menu"
            ctx.session.currentBlacklistedProfile = null;

            await ctx.reply(ctx.t('sleep_menu'), {
                reply_markup: profileKeyboard()
            })
        }

    } else if (message === ctx.t("blacklist_remove")) {
        if (!ctx.session.currentBlacklistedProfile) {
            await ctx.reply(ctx.t("error_occurred"));
            return;
        }

        try {
            const result = await getNextBlacklistProfile(ctx, ctx.session.currentBlacklistedProfile.id);

            await prisma.blacklist.deleteMany({
                where: {
                    userId: String(ctx.from?.id),
                    targetProfileId: ctx.session.currentBlacklistedProfile.id
                }
            });
            await ctx.reply(ctx.t("blacklist_remove_success"));


            if (result.profile) {
                ctx.session.currentBlacklistedProfile = result.profile;

                await sendForm(ctx, result.profile.user, {
                    myForm: false,
                    isBlacklist: true,
                    blacklistCount: result.remainingCount - 1
                });
            } else {
                await ctx.reply(ctx.t('blacklist_no_more_users'))

                ctx.session.step = "sleep_menu"
                ctx.session.currentBlacklistedProfile = null;

                await ctx.reply(ctx.t("sleep_menu"), {
                    reply_markup: profileKeyboard()
                });
            }

        } catch (error) {
            console.error("Error removing user from blacklist:", error);
            await ctx.reply(ctx.t("blacklist_remove_error"));
        }
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: blacklistKeyboard(ctx.t)
        });
    }

} 