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
exports.complainReasonCallbackQuery = void 0;
const postgres_1 = require("../db/postgres");
const logger_1 = require("../logger");
const complainReasonCallbackQuery = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    logger_1.logger.info({ userId: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id, reason: (_b = ctx.callbackQuery) === null || _b === void 0 ? void 0 : _b.data }, 'User selected complaint reason');
    const callbackQuery = ctx.callbackQuery;
    const callbackData = callbackQuery.data;
    const callbackParts = callbackData.split(":");
    const reasonId = callbackParts[1];
    const targetUserId = callbackParts[2];
    const fromUserId = String((_c = ctx.callbackQuery) === null || _c === void 0 ? void 0 : _c.from.id);
    // Маппинг ID причины на типы отчетов из Prisma
    const reasonToReportType = {
        "1": "adult_content",
        "2": "sale",
        "3": "fake",
        "4": "advertising",
        "5": "scam",
        "6": "dislike",
        "7": "other"
    };
    const reportType = reasonToReportType[reasonId];
    try {
        // Проверяем, не отправлял ли пользователь уже жалобу
        const existingComplaint = yield postgres_1.prisma.report.findFirst({
            where: {
                reporterId: fromUserId,
                targetId: targetUserId
            }
        });
        if (existingComplaint) {
            yield ctx.answerCallbackQuery({
                text: ctx.t('you_already_sent_complain_to_this_user'),
                show_alert: true
            });
            return;
        }
        // Создаем жалобу в базе данных
        yield postgres_1.prisma.report.create({
            data: {
                reporterId: fromUserId,
                targetId: targetUserId,
                type: reportType,
                text: "" // Без комментария
            }
        });
        // Отображаем сообщение, что жалоба принята
        if ((_d = ctx.callbackQuery) === null || _d === void 0 ? void 0 : _d.message) {
            yield ctx.api.editMessageText(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id, ctx.t('complain_will_be_examined'), { reply_markup: { inline_keyboard: [] } });
        }
        yield ctx.answerCallbackQuery({
            text: ctx.t('complain_will_be_examined'),
            show_alert: false
        });
    }
    catch (error) {
        ctx.logger.error({
            error,
            action: 'Error handling complaint reason',
            fromUserId,
            targetUserId,
            reasonId
        });
        yield ctx.answerCallbackQuery({
            text: ctx.t('error_occurred'),
            show_alert: true
        });
    }
});
exports.complainReasonCallbackQuery = complainReasonCallbackQuery;
