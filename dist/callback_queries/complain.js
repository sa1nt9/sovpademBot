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
exports.complainCallbackQuery = void 0;
const keyboards_1 = require("../constants/keyboards");
const logger_1 = require("../logger");
const complainCallbackQuery = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    logger_1.logger.info({ userId: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id }, 'User initiated complaint');
    const callbackQuery = ctx.callbackQuery;
    const callbackData = callbackQuery.data;
    yield ctx.answerCallbackQuery({
        text: "👇",
        show_alert: false,
        cache_time: 86400
    });
    const userId = callbackData.split(":")[1];
    ctx.session.additionalFormInfo.reportedUserId = userId;
    ctx.session.step = 'complain';
    yield ctx.answerCallbackQuery();
    yield ctx.reply(ctx.t('complain_text'), {
        reply_markup: (0, keyboards_1.complainKeyboard)()
    });
});
exports.complainCallbackQuery = complainCallbackQuery;
