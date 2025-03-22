import { MyContext } from "../typescript/context";
import { ReactionType } from "@prisma/client";
import { prisma } from "../db/postgres";
import { getReactionEmoji } from "../constants/reaction";
import { MAX_USER_REACTIONS } from "../constants/complain";
import { complainReasonKeyboard } from "../constants/keyboards";

export const reactionCallbackQuery = async (ctx: MyContext) => {
    const callbackQuery = ctx.callbackQuery!;
    const callbackData = callbackQuery.data || "";
    const callbackParts = callbackData.split(":");
    const reactionType = callbackParts[1] as ReactionType | "complain";
    const targetUserId = callbackParts[2];
    const fromUserId = String(callbackQuery.from.id);

    const currentDate = new Date();
    
    const messageTimestamp = callbackQuery.message?.date || Math.floor(currentDate.getTime() / 1000) - 600;
    const messageDate = new Date(messageTimestamp * 1000);
    
    const messageAgeInSeconds = Math.floor((currentDate.getTime() - messageDate.getTime()) / 1000);
    
    const isMessageTooOld = messageAgeInSeconds > 3600;
    
    if (isMessageTooOld) {
        await ctx.answerCallbackQuery({
            text: ctx.t('reaction_time_expired'),
            show_alert: true
        });
        return;
    }

    ctx.logger.info({
        action: 'Reaction',
        fromUserId,
        targetUserId,
        reactionType,
        messageAgeInSeconds
    });

    if (reactionType === "complain") {
        if (callbackQuery.message) {
            ctx.session.originalReactionMessage = {
                text: callbackQuery.message.text || "",
                messageId: callbackQuery.message.message_id,
                chatId: callbackQuery.message.chat.id
            };
        }

        // Меняем текст и клавиатуру
        if (callbackQuery.message) {
            await ctx.api.editMessageText(
                callbackQuery.message.chat.id,
                callbackQuery.message.message_id,
                ctx.t('complain_type_select'),
                { reply_markup: complainReasonKeyboard(ctx.t, targetUserId) }
            );
        }

        await ctx.answerCallbackQuery();
        return;
    }

    try {
        const userReactionsCount = await prisma.rouletteReaction.count({
            where: {
                fromUserId,
                toUserId: targetUserId
            }
        });

        if (userReactionsCount >= MAX_USER_REACTIONS) {
            const oldestReaction = await prisma.rouletteReaction.findFirst({
                where: {
                    fromUserId,
                    toUserId: targetUserId
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });

            if (oldestReaction) {
                await prisma.rouletteReaction.delete({
                    where: {
                        id: oldestReaction.id
                    }
                });
            }
        }

        // Создаем новую реакцию
        await prisma.rouletteReaction.create({
            data: {
                fromUserId,
                toUserId: targetUserId,
                type: reactionType
            }
        });

        await ctx.answerCallbackQuery({
            text: ctx.t('reaction_added'),
            show_alert: false
        });

        // Получаем эмодзи для типа реакции
        const reactionEmoji = getReactionEmoji(reactionType);

        // Обновляем сообщение, убираем клавиатуру и меняем текст
        if (callbackQuery.message) {
            ctx.logger.info('1');
            await ctx.api.editMessageText(
                callbackQuery.message.chat.id,
                callbackQuery.message.message_id,
                `${ctx.t('reaction_you_added')} ${reactionEmoji}`,
                { reply_markup: { inline_keyboard: [] } }
            )
            ctx.logger.info('2');
        }
    } catch (error) {
        ctx.logger.error({
            error,
            action: 'Error handling reaction',
            fromUserId,
            targetUserId,
            reactionType
        });

        await ctx.answerCallbackQuery({
            text: ctx.t('error_occurred'),
            show_alert: false
        });
    }
} 