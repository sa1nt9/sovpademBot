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
exports.complainStep = complainStep;
const keyboards_1 = require("../constants/keyboards");
const getCandidate_1 = require("../functions/db/getCandidate");
const sendForm_1 = require("../functions/sendForm");
function complainStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = ctx.message.text;
        if (message === '1 🔞') {
            ctx.session.additionalFormInfo.reportType = 'adult_content';
            ctx.session.step = 'complain_text';
            yield ctx.reply(ctx.t('write_complain_comment'), {
                reply_markup: (0, keyboards_1.goBackKeyboard)(ctx.t)
            });
        }
        else if (message === '2 💰') {
            ctx.session.additionalFormInfo.reportType = 'sale';
            ctx.session.step = 'complain_text';
            yield ctx.reply(ctx.t('write_complain_comment'), {
                reply_markup: (0, keyboards_1.goBackKeyboard)(ctx.t)
            });
        }
        else if (message === '3 💩') {
            ctx.session.additionalFormInfo.reportType = 'dislike';
            ctx.session.step = 'complain_text';
            yield ctx.reply(ctx.t('write_complain_comment'), {
                reply_markup: (0, keyboards_1.goBackKeyboard)(ctx.t)
            });
        }
        else if (message === '4 🦨') {
            ctx.session.additionalFormInfo.reportType = 'other';
            ctx.session.step = 'complain_text';
            yield ctx.reply(ctx.t('write_complain_comment'), {
                reply_markup: (0, keyboards_1.goBackKeyboard)(ctx.t)
            });
        }
        else if (message === '9') {
            ctx.session.step = 'search_people';
            yield ctx.reply("✨🔍", {
                reply_markup: (0, keyboards_1.answerFormKeyboard)()
            });
            const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
            yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
        }
        else {
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.complainKeyboard)()
            });
        }
    });
}
