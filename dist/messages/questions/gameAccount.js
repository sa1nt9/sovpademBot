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
exports.gameAccountQuestion = void 0;
const keyboards_1 = require("../../constants/keyboards");
const saveUser_1 = require("../../functions/db/saveUser");
const gameLink_1 = require("../../functions/gameLink");
const sendForm_1 = require("../../functions/sendForm");
const gameAccountQuestion = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const message = ctx.message.text;
    if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
        ctx.session.step = 'profile';
        ctx.session.additionalFormInfo.canGoBack = false;
        yield (0, sendForm_1.sendForm)(ctx);
        yield ctx.reply(ctx.t('profile_menu'), {
            reply_markup: (0, keyboards_1.profileKeyboard)()
        });
    }
    else if (message && !(0, gameLink_1.getGameUsername)(ctx.session.additionalFormInfo.selectedSubType, message) && message !== ctx.t('skip') && message !== ctx.t('leave_current')) {
        yield ctx.reply(ctx.t('game_account_question_validate'), {
            reply_markup: (0, keyboards_1.gameAccountKeyboard)(ctx.t, ctx.session)
        });
    }
    else {
        if (message !== ctx.t('leave_current')) {
            ctx.session.activeProfile.accountLink = (!message || message === ctx.t('skip')) ? "" : ((0, gameLink_1.getGameUsername)(ctx.session.additionalFormInfo.selectedSubType, message) || "");
        }
        if (ctx.session.additionalFormInfo.canGoBack) {
            ctx.session.step = 'profile';
            ctx.session.additionalFormInfo.canGoBack = false;
            yield (0, saveUser_1.saveUser)(ctx);
            yield (0, sendForm_1.sendForm)(ctx);
            yield ctx.reply(ctx.t('profile_menu'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
        else {
            ctx.session.question = 'years';
            yield ctx.reply(ctx.t('years_question'), {
                reply_markup: (0, keyboards_1.ageKeyboard)(ctx.session)
            });
        }
    }
});
exports.gameAccountQuestion = gameAccountQuestion;
