"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactionCallbackQuery = void 0;
const postgres_1 = require("../db/postgres");
const reaction_1 = require("../constants/reaction");
const complain_1 = require("../constants/complain");
const keyboards_1 = require("../constants/keyboards");
const reactionCallbackQuery = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const callbackQuery = ctx.callbackQuery;
    const callbackData = callbackQuery.data || "";
    const callbackParts = callbackData.split(":");
    const reactionType = callbackParts[1];
    const targetUserId = callbackParts[2];
    const fromUserId = String(callbackQuery.from.id);
    const currentDate = new Date();
    const messageTimestamp = ((_a = callbackQuery.message) === null || _a === void 0 ? void 0 : _a.date) || Math.floor(currentDate.getTime() / 1000) - 600;
    const messageDate = new Date(messageTimestamp * 1000);
    const messageAgeInSeconds = Math.floor((currentDate.getTime() - messageDate.getTime()) / 1000);
    const isMessageTooOld = messageAgeInSeconds > 3600;
    if (isMessageTooOld) {
        yield ctx.answerCallbackQuery({
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
            yield ctx.api.editMessageText(callbackQuery.message.chat.id, callbackQuery.message.message_id, ctx.t('complain_type_select'), { reply_markup: (0, keyboards_1.complainReasonKeyboard)(ctx.t, targetUserId) });
        }
        yield ctx.answerCallbackQuery();
        return;
    }
    try {
        const userReactionsCount = yield postgres_1.prisma.rouletteReaction.count({
            where: {
                fromUserId,
                toUserId: targetUserId
            }
        });
        if (userReactionsCount >= complain_1.MAX_USER_REACTIONS) {
            const oldestReaction = yield postgres_1.prisma.rouletteReaction.findFirst({
                where: {
                    fromUserId,
                    toUserId: targetUserId
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });
            if (oldestReaction) {
                yield postgres_1.prisma.rouletteReaction.delete({
                    where: {
                        id: oldestReaction.id
                    }
                });
            }
        }
        // Создаем новую реакцию
        yield postgres_1.prisma.rouletteReaction.create({
            data: {
                fromUserId,
                toUserId: targetUserId,
                type: reactionType
            }
        });
        yield ctx.answerCallbackQuery({
            text: ctx.t('reaction_added'),
            show_alert: false
        });
        // Получаем эмодзи для типа реакции
        const reactionEmoji = (0, reaction_1.getReactionEmoji)(reactionType);
        // Обновляем сообщение, убираем клавиатуру и меняем текст
        if (callbackQuery.message) {
            ctx.logger.info('1');
            yield ctx.api.editMessageText(callbackQuery.message.chat.id, callbackQuery.message.message_id, `${ctx.t('reaction_you_added')} ${reactionEmoji}`, { reply_markup: { inline_keyboard: [] } });
            ctx.logger.info('2');
        }
    }
    catch (error) {
        ctx.logger.error({
            error,
            action: 'Error handling reaction',
            fromUserId,
            targetUserId,
            reactionType
        });
        yield ctx.answerCallbackQuery({
            text: ctx.t('error_occurred'),
            show_alert: false
        });
    }
});
exports.reactionCallbackQuery = reactionCallbackQuery;
