import { blacklistKeyboard, goBackKeyboard, profileKeyboard, skipKeyboard, textOrVideoKeyboard } from '../constants/keyboards';
import { prisma } from '../db/postgres';
import { getNextBlacklistProfile } from '../functions/db/getNextBlacklistProfile';
import { sendForm } from '../functions/sendForm';
import { MyContext } from '../typescript/context';

export async function blacklistUserStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const userId = String(ctx.from?.id);
    
    ctx.logger.info({ userId }, 'User in blacklist management menu');

    if (message === ctx.t('main_menu')) {
        ctx.logger.info({ userId }, 'User returning to main menu from blacklist');
        ctx.session.step = "profile";

        await sendForm(ctx)

        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else if (message === ctx.t("see_next")) {
        if (!ctx.session.currentBlacklistedProfile) {
            ctx.logger.warn({ userId }, 'User tried to see next blacklist profile but no current profile was found');
            await ctx.reply(ctx.t("error_occurred"));
            return;
        }
        
        const currentProfileId = ctx.session.currentBlacklistedProfile.id;
        ctx.logger.info({ userId, currentBlacklistedProfileId: currentProfileId }, 'User requesting next blacklisted profile');
        
        const nextProfile = await getNextBlacklistProfile(ctx, currentProfileId);

        if (nextProfile.profile && nextProfile.profile.user) {
            const nextProfileId = nextProfile.profile.id;
            const nextProfileUserId = nextProfile.profile.user.id;
            ctx.logger.info({ 
                userId, 
                nextProfileId, 
                nextProfileUserId,
                remainingCount: nextProfile.remainingCount 
            }, 'Found next blacklisted profile');
            
            ctx.session.currentBlacklistedProfile = nextProfile.profile;

            await sendForm(ctx, nextProfile.profile.user, {
                myForm: false,
                isBlacklist: true,
                blacklistCount: nextProfile.remainingCount
            });
        } else {
            ctx.logger.info({ userId }, 'No more blacklisted profiles available');
            await ctx.reply(ctx.t('blacklist_no_more_users'));
            ctx.session.step = "sleep_menu";
            ctx.session.currentBlacklistedProfile = null;

            await ctx.reply(ctx.t('sleep_menu'), {
                reply_markup: profileKeyboard()
            });
        }

    } else if (message === ctx.t("blacklist_remove")) {
        if (!ctx.session.currentBlacklistedProfile) {
            ctx.logger.warn({ userId }, 'User tried to remove profile from blacklist but no current profile was found');
            await ctx.reply(ctx.t("error_occurred"));
            return;
        }

        const profileToRemoveId = ctx.session.currentBlacklistedProfile.id;
        ctx.logger.info({ userId, profileToRemoveId }, 'Removing profile from blacklist');

        try {
            const result = await getNextBlacklistProfile(ctx, profileToRemoveId);

            await prisma.blacklist.deleteMany({
                where: {
                    userId,
                    targetProfileId: profileToRemoveId
                }
            });
            
            ctx.logger.info({ userId, profileToRemoveId }, 'Successfully removed profile from blacklist');
            await ctx.reply(ctx.t("blacklist_remove_success"));

            if (result.profile && result.profile.user) {
                const nextProfileId = result.profile.id;
                ctx.logger.info({ 
                    userId, 
                    nextProfileId,
                    remainingCount: result.remainingCount - 1 
                }, 'Showing next blacklisted profile after removal');
                
                ctx.session.currentBlacklistedProfile = result.profile;

                await sendForm(ctx, result.profile.user, {
                    myForm: false,
                    isBlacklist: true,
                    blacklistCount: result.remainingCount - 1
                });
            } else {
                ctx.logger.info({ userId }, 'No more blacklisted profiles after removal');
                await ctx.reply(ctx.t('blacklist_no_more_users'));

                ctx.session.step = "sleep_menu";
                ctx.session.currentBlacklistedProfile = null;

                await ctx.reply(ctx.t("sleep_menu"), {
                    reply_markup: profileKeyboard()
                });
            }

        } catch (error) {
            ctx.logger.error({ userId, error, profileId: profileToRemoveId }, 'Error removing profile from blacklist');
            console.error("Error removing user from blacklist:", error);
            await ctx.reply(ctx.t("blacklist_remove_error"));
        }
    } else {
        ctx.logger.warn({ userId, message }, 'User sent unexpected message in blacklist menu');
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: blacklistKeyboard(ctx.t)
        });
    }
} 