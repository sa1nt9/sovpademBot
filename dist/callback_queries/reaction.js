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
const reactionCallbackQuery = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const callbackData = ((_a = ctx.callbackQuery) === null || _a === void 0 ? void 0 : _a.data) || "";
    const callbackParts = callbackData.split(":");
    const reactionType = callbackParts[1];
    const targetUserId = callbackParts[2];
    const fromUserId = String((_b = ctx.callbackQuery) === null || _b === void 0 ? void 0 : _b.from.id);
    ctx.logger.info({
        action: 'Reaction',
        fromUserId,
        targetUserId,
        reactionType
    });
    // Если выбрана жалоба
    if (reactionType === "complain") {
        // Сохраняем исходное сообщение, чтобы можно было восстановить при нажатии "Назад"
        if ((_c = ctx.callbackQuery) === null || _c === void 0 ? void 0 : _c.message) {
            // Сохраняем информацию об оригинальном сообщении в сессии
            ctx.session.originalReactionMessage = {
                text: ctx.callbackQuery.message.text || "",
                messageId: ctx.callbackQuery.message.message_id,
                chatId: ctx.callbackQuery.message.chat.id
            };
        }
        // Создаем клавиатуру с причинами жалобы
        const complainReasons = {
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
        if ((_d = ctx.callbackQuery) === null || _d === void 0 ? void 0 : _d.message) {
            yield ctx.api.editMessageText(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id, ctx.t('complain_text'), { reply_markup: complainReasons });
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
        if ((_e = ctx.callbackQuery) === null || _e === void 0 ? void 0 : _e.message) {
            ctx.logger.info('1');
            yield ctx.api.editMessageText(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id, `${ctx.t('reaction_you_added')} ${reactionEmoji}`, { reply_markup: { inline_keyboard: [] } });
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
