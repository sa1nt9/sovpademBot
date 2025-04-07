import { complainToUserKeyboard, continueSeeFormsKeyboard, profileKeyboard, somebodysLikedYouKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { MyContext } from "../typescript/context";
import { ISessionData } from "../typescript/interfaces/ISessionData";
import { getLikesInfo } from "./db/getLikesInfo";
import { sendForm } from "./sendForm";

export async function sendLikesNotification(ctx: MyContext, targetUserId: string, isAnswer?: boolean) {
    const { count, gender } = await getLikesInfo(targetUserId, 'user');

    try {
        const currentSession = await prisma.session.findUnique({
            where: {
                key: targetUserId
            }
        });

        if (currentSession) {
            const currentValue = currentSession ? JSON.parse(currentSession.value as string) as ISessionData : {} as ISessionData;

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
                ctx.logger.info({ currentValue, targetUserId, isAnswer })
                if ((currentValue.step === 'search_people' || currentValue.step === 'search_people_with_likes') && currentValue.currentCandidateProfile?.id) {
                    await ctx.api.sendMessage(targetUserId, ctx.t('somebody_liked_you_end_with_it'));

                    await prisma.session.update({
                        where: {
                            key: targetUserId
                        },
                        data: {
                            value: JSON.stringify({
                                ...currentValue,
                                pendingMutualLike: true,
                                pendingMutualLikeProfileId: String(ctx.from?.id)
                            })
                        }
                    });
                } else {
                    const userLike = await prisma.profileLike.findFirst({
                        where: {
                            toProfileId: targetUserId,
                            fromProfileId: String(ctx.from?.id),
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

                    await ctx.api.sendMessage(targetUserId, `${ctx.t('mutual_sympathy')} [${ctx.session.activeProfile.name}](https://t.me/${ctx.from?.username})`, {
                        reply_markup: complainToUserKeyboard(ctx.t, String(ctx.from?.id)),
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

                    await ctx.api.sendMessage(targetUserId, ctx.t('sleep_menu'), {
                        reply_markup: profileKeyboard()
                    });
                }
            } else {
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

                await ctx.api.sendMessage(targetUserId, ctx.t('somebodys_liked_you', {
                    count,
                    gender,
                    userGender
                }), {
                    reply_markup: somebodysLikedYouKeyboard()
                });
            }
        } else {
            ctx.logger.error('Error updating session somebodys_liked_you, session not found')
        }

    } catch (error) {
        ctx.logger.error(error, 'Error updating session somebodys_liked_you')
    }
}