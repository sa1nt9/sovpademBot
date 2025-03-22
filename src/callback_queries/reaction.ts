import { MyContext } from "../typescript/context";
import { ReactionType } from "@prisma/client";
import { prisma } from "../db/postgres";
import { getReactionEmoji } from "../constants/reaction";
import { MAX_USER_REACTIONS } from "../constants/complain";
import { InlineKeyboardMarkup } from "@grammyjs/types";

export const reactionCallbackQuery = async (ctx: MyContext) => {
    const callbackData = ctx.callbackQuery?.data || "";
    const callbackParts = callbackData.split(":");
    const reactionType = callbackParts[1] as ReactionType | "complain";
    const targetUserId = callbackParts[2];
    const fromUserId = String(ctx.callbackQuery?.from.id);

    ctx.logger.info({
        action: 'Reaction',
        fromUserId,
        targetUserId,
        reactionType
    });

    // Если выбрана жалоба
    if (reactionType === "complain") {
        // Сохраняем исходное сообщение, чтобы можно было восстановить при нажатии "Назад"
        if (ctx.callbackQuery?.message) {
            // Сохраняем информацию об оригинальном сообщении в сессии
            ctx.session.originalReactionMessage = {
                text: ctx.callbackQuery.message.text || "",
                messageId: ctx.callbackQuery.message.message_id,
                chatId: ctx.callbackQuery.message.chat.id
            };
        }

        // Создаем клавиатуру с причинами жалобы
        const complainReasons: InlineKeyboardMarkup = {
            inline_keyboard: [
                [
                    { text: ctx.t("complain_1"), callback_data: `complain_reason:1:${targetUserId}` }
                ],
                [
                    { text: ctx.t("complain_2"), callback_data: `complain_reason:2:${targetUserId}` }
                ],
                [
                    { text: ctx.t("complain_3"), callback_data: `complain_reason:3:${targetUserId}` }
                ],
                [
                    { text: ctx.t("complain_4"), callback_data: `complain_reason:4:${targetUserId}` }
                ],
                [
                    { text: ctx.t("complain_5"), callback_data: `complain_reason:5:${targetUserId}` }
                ],
                [
                    { text: ctx.t("complain_6"), callback_data: `complain_reason:6:${targetUserId}` }
                ],
                [
                    { text: `↩️ ${ctx.t("back")}`, callback_data: `complain_back:${targetUserId}` }
                ]
            ]
        };

        // Меняем текст и клавиатуру
        if (ctx.callbackQuery?.message) {
            await ctx.api.editMessageText(
                ctx.callbackQuery.message.chat.id,
                ctx.callbackQuery.message.message_id,
                ctx.t('complain_text'),
                { reply_markup: complainReasons }
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
        if (ctx.callbackQuery?.message) {
            ctx.logger.info('1');
            await ctx.api.editMessageText(
                ctx.callbackQuery.message.chat.id,
                ctx.callbackQuery.message.message_id,
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