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
exports.callbackQueryEvent = void 0;
const complain_1 = require("../callback_queries/complain");
const complain_back_1 = require("../callback_queries/complain_back");
const complain_reason_1 = require("../callback_queries/complain_reason");
const reaction_1 = require("../callback_queries/reaction");
const reveal_accept_1 = require("../callback_queries/reveal_accept");
const reveal_reject_1 = require("../callback_queries/reveal_reject");
const reveal_username_accept_1 = require("../callback_queries/reveal_username_accept");
const reveal_username_reject_1 = require("../callback_queries/reveal_username_reject");
const callbackQueryEvent = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const callbackQuery = ctx.callbackQuery;
    const callbackData = callbackQuery.data;
    if (callbackData) {
        if (callbackData.startsWith("complain:")) {
            yield (0, complain_1.complainCallbackQuery)(ctx);
        }
        else if (callbackData.startsWith("reveal_accept:")) {
            yield (0, reveal_accept_1.revealAcceptCallbackQuery)(ctx);
        }
        else if (callbackData.startsWith("reveal_reject:")) {
            yield (0, reveal_reject_1.revealRejectCallbackQuery)(ctx);
        }
        else if (callbackData.startsWith("reveal_username_accept:")) {
            yield (0, reveal_username_accept_1.revealUsernameAcceptCallbackQuery)(ctx);
        }
        else if (callbackData.startsWith("reveal_username_reject:")) {
            yield (0, reveal_username_reject_1.revealUsernameRejectCallbackQuery)(ctx);
        }
        else if (callbackData.startsWith("reaction:")) {
            yield (0, reaction_1.reactionCallbackQuery)(ctx);
        }
        else if (callbackData.startsWith("complain_reason:")) {
            yield (0, complain_reason_1.complainReasonCallbackQuery)(ctx);
        }
        else if (callbackData.startsWith("complain_back:")) {
            yield (0, complain_back_1.complainBackCallbackQuery)(ctx);
        }
    }
});
exports.callbackQueryEvent = callbackQueryEvent;
