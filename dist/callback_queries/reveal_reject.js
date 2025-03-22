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
exports.revealRejectCallbackQuery = void 0;
const revealRejectCallbackQuery = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const callbackQuery = ctx.callbackQuery;
    const callbackData = callbackQuery.data;
    const userId = callbackData.split(":")[1];
    yield ctx.answerCallbackQuery({
        text: ctx.t('roulette_reveal_rejected'),
        show_alert: false
    });
    // Изменяем текст и удаляем клавиатуру
    if (callbackQuery.message) {
        yield ctx.api.editMessageText(callbackQuery.message.chat.id, callbackQuery.message.message_id, ctx.t('roulette_reveal_rejected'), { reply_markup: { inline_keyboard: [] } });
    }
    yield ctx.api.sendMessage(userId, ctx.t('roulette_reveal_rejected_message'));
});
exports.revealRejectCallbackQuery = revealRejectCallbackQuery;
