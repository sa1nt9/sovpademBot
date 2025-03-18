import { continueSeeFormsKeyboard, profileKeyboard, somebodysLikedYouKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { bot } from "../main";
import { MyContext } from "../typescript/context";
import { getLikesInfo } from "./db/getLikesInfo";
import { sendForm } from "./sendForm";

export async function sendLikesNotification(ctx: MyContext, targetUserId: string, isAnswer?: boolean) {
    const { count, gender } = await getLikesInfo(targetUserId);

    if (count > 0) {
        try {
            const currentSession = await prisma.session.findUnique({
                where: {
                    key: targetUserId
                }
            });

            if (currentSession) {
                const currentValue = currentSession ? JSON.parse(currentSession.value as string) : {};

                if (isAnswer) {
                    
                    await sendForm(ctx, null, { myForm: true, sendTo: targetUserId })
                    
                    await bot.api.sendMessage(targetUserId, `${ctx.t('mutual_sympathy')} [${ctx.session.form.name}](https://t.me/${ctx.from?.username})`, {
                        reply_markup: continueSeeFormsKeyboard(ctx.t),
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

                    await bot.api.sendMessage(targetUserId, ctx.t('sleep_menu'), {
                        reply_markup: profileKeyboard()
                    });
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

                    await bot.api.sendMessage(targetUserId, ctx.t('somebodys_liked_you', {
                        count,
                        gender
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

}