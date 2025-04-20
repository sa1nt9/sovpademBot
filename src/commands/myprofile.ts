import { createProfileTypeKeyboard } from './../constants/keyboards';
import { acceptPrivacyKeyboard, ageKeyboard, profileKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { sendForm } from "../functions/sendForm";
import { MyContext } from "../typescript/context";
import { restoreProfileValues } from '../functions/restoreProfileValues';

export const myprofileCommand = async (ctx: MyContext) => {
    const userId = String(ctx.message?.from.id);

    ctx.logger.info({ 
        userId,
        username: ctx.from?.username,
        isEditingProfile: ctx.session.isEditingProfile,
        privacyAccepted: ctx.session.privacyAccepted
    }, 'Processing myprofile command');

    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });
    
    if (existingUser) {
        if (ctx.session.isEditingProfile) {
            ctx.session.isEditingProfile = false;
            ctx.logger.info({
                userId,
                action: 'restore_profile'
            }, 'Restoring profile values');

            await restoreProfileValues(ctx);
        }

        ctx.session.step = "profile";
        ctx.logger.info({
            userId,
            step: ctx.session.step
        }, 'Sending profile for existing user');

        await sendForm(ctx);

        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else {
        if (ctx.session.privacyAccepted) {
            ctx.session.step = "create_profile_type";
            ctx.session.isCreatingProfile = true;
            ctx.logger.info({
                userId,
                step: ctx.session.step
            }, 'Starting profile creation for new user');

            await ctx.reply(ctx.t('profile_type_title'), {
                reply_markup: createProfileTypeKeyboard(ctx.t)
            });
        } else {
            ctx.session.step = "accept_privacy";
            ctx.logger.info({
                userId,
                step: ctx.session.step
            }, 'Showing privacy policy for new user');

            await ctx.reply(ctx.t('privacy_message'), {
                reply_markup: acceptPrivacyKeyboard(ctx.t),
                parse_mode: "Markdown"
            });
        }
    }
}