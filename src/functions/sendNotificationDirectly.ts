import { MyContext } from "../typescript/context";
import { getLikesInfo } from "./db/getLikesInfo";
import { prisma } from "../db/postgres";
import { i18n } from "../i18n";
import { ISessionData } from "../typescript/interfaces/ISessionData";
import { complainToUserKeyboard, profileKeyboard, somebodysLikedYouKeyboard } from "../constants/keyboards";
import { sendForm } from "./sendForm";
import { ProfileType } from "@prisma/client";
import { TProfileSubType } from "../typescript/interfaces/IProfile";


export async function sendNotificationDirectly(
    ctx: MyContext,
    targetUserId: string,
    fromUserId: string,
    targetProfileId: string,
    fromProfileId: string,
    profileType: ProfileType,
    subType: TProfileSubType | '',
    isAnswer?: boolean
): Promise<void> {
    ctx.logger.info({ 
        fromUserId,
        targetUserId,
        targetProfileId,
        fromProfileId,
        isAnswer
    }, 'Sending notification directly');

    const { count, gender } = await getLikesInfo(targetUserId, 'user');

    try {
        const currentSession = await prisma.session.findUnique({
            where: {
                key: targetUserId
            }
        });

        if (currentSession) {
            const currentValue = JSON.parse(currentSession.value as string) as ISessionData;

            // Получаем пользователя, чтобы узнать его пол
            const targetUser = await prisma.user.findUnique({
                where: {
                    id: targetUserId
                },
                select: {
                    gender: true
                }
            });

            // Пол пользователя для правильного склонения
            const userGender = targetUser?.gender === 'female' ? 'female' : 'male';
            
            if (isAnswer) {
                ctx.logger.info({ 
                    fromUserId,
                    targetUserId,
                    step: currentValue.step,
                    hasCurrentCandidate: !!currentValue.currentCandidateProfile?.id
                }, 'Processing mutual like notification');

                if ((currentValue.step === 'search_people' || currentValue.step === 'search_people_with_likes') && currentValue.currentCandidateProfile?.id) {
                    await ctx.api.sendMessage(targetUserId, i18n(false).t(currentValue.__language_code || "ru", 'somebody_liked_you_end_with_it'));

                    await prisma.session.update({
                        where: {
                            key: targetUserId
                        },
                        data: {
                            value: JSON.stringify({
                                ...currentValue,
                                pendingMutualLike: true,
                                pendingMutualLikeProfileId: fromProfileId,
                                pendingMutualLikeProfileType: profileType
                            })
                        }
                    });

                    ctx.logger.info({ 
                        fromUserId,
                        targetUserId,
                        step: currentValue.step
                    }, 'Updated session with pending mutual like');
                } else {
                    const userLike = await prisma.profileLike.findFirst({
                        where: {
                            toProfileId: fromProfileId,
                            fromProfileId: targetProfileId,
                            liked: true
                        },
                        orderBy: {
                            createdAt: 'desc'
                        },
                        select: {
                            privateNote: true
                        }
                    });

                    await sendForm(ctx, null, {
                        myForm: true,
                        sendTo: targetUserId,
                        privateNote: userLike?.privateNote,
                        profileType: profileType,
                        subType: subType || undefined
                    });

                    await ctx.api.sendMessage(targetUserId, `${i18n(false).t(currentValue.__language_code || "ru", 'mutual_sympathy')} [${ctx.session.activeProfile.name}](https://t.me/${ctx.from?.username || ''})`, {
                        reply_markup: complainToUserKeyboard((...args) => i18n(false).t(currentValue.__language_code || "ru", ...args), fromUserId),
                        link_preview_options: {
                            is_disabled: true
                        },
                        parse_mode: 'Markdown',
                    });

                    await prisma.session.update({
                        where: {
                            key: targetUserId
                        },
                        data: {
                            value: JSON.stringify({
                                ...currentValue,
                                step: 'sleep_menu',
                            })
                        }
                    });

                    await ctx.api.sendMessage(targetUserId, i18n(false).t(currentValue.__language_code || "ru", 'sleep_menu'), {
                        reply_markup: profileKeyboard()
                    });

                    ctx.logger.info({ 
                        fromUserId,
                        targetUserId,
                        targetProfileId,
                        fromProfileId
                    }, 'Sent mutual sympathy notification and updated session');
                }
            } else {
                if (count === 0) return 
                
                ctx.logger.info({ 
                    fromUserId,
                    targetUserId,
                    targetProfileId,
                    fromProfileId,
                    count,
                    gender,
                    userGender
                }, 'Sending new likes notification');

                await prisma.session.update({
                    where: {
                        key: targetUserId
                    },
                    data: {
                        value: JSON.stringify({
                            ...currentValue,
                            step: 'somebodys_liked_you',
                        })
                    }
                });

                await ctx.api.sendMessage(targetUserId, i18n(false).t(currentValue.__language_code || "ru", 'somebodys_liked_you', {
                    count,
                    gender,
                    userGender
                }), {
                    reply_markup: somebodysLikedYouKeyboard(),
                    parse_mode: 'HTML'
                });

                ctx.logger.info({ 
                    fromUserId,
                    targetUserId,
                    targetProfileId,
                    fromProfileId
                }, 'Sent new likes notification and updated session');
            }
        } else {
            ctx.logger.error({ 
                fromUserId,
                targetUserId,
                targetProfileId,
                fromProfileId
            }, 'Error updating session somebodys_liked_you, session not found');
        }

    } catch (error) {
        ctx.logger.error({ 
            fromUserId,
            targetUserId,
            targetProfileId,
            fromProfileId,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, 'Error sending notification directly');
        
        throw error;
    }
} 