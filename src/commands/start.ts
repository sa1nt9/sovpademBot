import { createFormKeyboard, languageKeyboard, mainMenuKeyboard, profileKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { decodeId } from "../functions/encodeId";
import { sendForm } from "../functions/sendForm";
import { MyContext } from "../typescript/context";

export const startCommand = async (ctx: MyContext) => {
    const userId = String(ctx.from?.id);
    const startParam = ctx.message?.text?.split(' ')[1];

    ctx.logger.info({ 
        userId,
        username: ctx.from?.username,
        startParam,
        isNewUser: !ctx.session?.step
    }, 'Processing start command');

    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    ctx.logger.info({
        userId,
        isExistingUser: !!existingUser,
        referrerId: ctx.session.referrerId
    }, 'User lookup completed');

    if (startParam?.startsWith('i_')) {
        const encodedReferrerId = startParam.substring(2);
        if (encodedReferrerId) {
            try {
                const referrerId = decodeId(encodedReferrerId);
                if (referrerId && referrerId !== userId) {
                    if (!existingUser) {
                        ctx.session.referrerId = referrerId;
                        ctx.logger.info({
                            userId,
                            referrerId,
                            encodedReferrerId
                        }, 'Referrer ID set for new user');
                    }
                }
            } catch (error) {
                ctx.logger.error({
                    userId,
                    encodedReferrerId,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined
                }, 'Error decoding referrer ID');
            }
        }
    } else if (startParam?.startsWith('profile_')) {
        const encodedId = startParam.substring(8);
        if (encodedId) {
            try {
                const profileUserId = decodeId(encodedId);
                if (profileUserId) {
                    ctx.logger.info({
                        userId,
                        profileUserId,
                        encodedId
                    }, 'Processing profile view request');

                    const user = await prisma.user.findUnique({
                        where: { id: profileUserId },
                    });

                    if (user && user?.id !== existingUser?.id) {
                        if (existingUser?.id) {
                            ctx.session.step = "go_main_menu";
                        } else {
                            ctx.session.step = "start_using_bot";
                        }

                        ctx.logger.info({
                            userId,
                            profileUserId,
                            step: ctx.session.step
                        }, 'Sending profile view');

                        await ctx.reply(ctx.t('this_is_user_profile'), {
                            reply_markup: existingUser?.id ? mainMenuKeyboard(ctx.t) : createFormKeyboard(ctx.t)
                        });

                        await sendForm(ctx, user, { myForm: false });
                        return;
                    } else if (user?.id !== existingUser?.id) {
                        ctx.logger.warn({
                            userId,
                            profileUserId
                        }, 'Profile not found');
                        await ctx.reply(ctx.t('user_not_found'));
                    }
                }
            } catch (error) {
                ctx.logger.error({
                    userId,
                    encodedId,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined
                }, 'Error decoding profile ID');
            }
        }
    } else if (startParam) {
        if (!existingUser) {
            ctx.session.referrerInfo = startParam;
        }
    }

    if (existingUser) {
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
        ctx.session.step = "choose_language_start";
        ctx.logger.info({
            userId,
            step: ctx.session.step
        }, 'Starting language selection for new user');

        await ctx.reply(ctx.t('choose_language'), {
            reply_markup: languageKeyboard
        });
    }
}