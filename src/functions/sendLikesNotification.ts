import { complainToUserKeyboard, continueSeeFormsKeyboard, profileKeyboard, somebodysLikedYouKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { i18n } from "../i18n";
import { MyContext } from "../typescript/context";
import { ISessionData } from "../typescript/interfaces/ISessionData";
import { getLikesInfo } from "./db/getLikesInfo";
import { sendForm } from "./sendForm";
import { scheduleNotification } from "../queues/utils";
import { sendNotificationDirectly } from "./sendNotificationDirectly";
import { NotificationType } from "@prisma/client";

export async function sendLikesNotification(ctx: MyContext, targetUserId: string, isAnswer?: boolean): Promise<void> {
    const fromUserId = String(ctx.from?.id);

    ctx.logger.info({
        fromUserId,
        targetUserId,
        isAnswer
    }, 'Starting likes notification');

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
                                pendingMutualLikeProfileId: fromUserId
                            })
                        }
                    });

                    ctx.logger.info({
                        fromUserId,
                        targetUserId,
                        step: currentValue.step
                    }, 'Updated session with pending mutual like');
                } else {
                    const rouletteUser = await prisma.rouletteUser.findUnique({
                        where: { id: targetUserId },
                        select: {
                            searchingPartner: true,
                            chatPartnerId: true
                        }
                    });

                    if (rouletteUser?.searchingPartner || rouletteUser?.chatPartnerId) {
                        await scheduleNotification(
                            targetUserId,
                            fromUserId,
                            NotificationType.MUTUAL_LIKE,
                            {
                                isAnswer: true,
                                delay: 2 * 60 * 1000
                            }
                        );
        
                        ctx.logger.info({
                            fromUserId,
                            targetUserId,
                            isAnswer,
                            notificationType: NotificationType.MUTUAL_LIKE
                        }, 'Notification scheduled successfully');

                        return
                    }

                    const userLike = await prisma.profileLike.findFirst({
                        where: {
                            toProfileId: targetUserId,
                            fromProfileId: fromUserId,
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
                        privateNote: userLike?.privateNote
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
                        targetUserId
                    }, 'Sent mutual sympathy notification and updated session');
                }
            } else {

                await scheduleNotification(
                    targetUserId,
                    fromUserId,
                    NotificationType.LIKE,
                    {
                        isAnswer: false
                    }
                );

                ctx.logger.info({
                    fromUserId,
                    targetUserId,
                    isAnswer,
                    notificationType: NotificationType.LIKE
                }, 'Notification scheduled successfully');
            }
        } else {
            ctx.logger.error({
                fromUserId,
                targetUserId
            }, 'Error updating session somebodys_liked_you, session not found');
        }

    } catch (error) {
        ctx.logger.error({
            fromUserId,
            targetUserId,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, 'Error updating session somebodys_liked_you');
    }
}