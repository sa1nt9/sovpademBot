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
exports.allRightQuestion = void 0;
const keyboards_1 = require("../../constants/keyboards");
const getCandidate_1 = require("../../functions/db/getCandidate");
const sendForm_1 = require("../../functions/sendForm");
const candidatesEnded_1 = require("../../functions/candidatesEnded");
const allRightQuestion = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const message = ctx.message.text;
    if (message === ctx.t("yes")) {
        ctx.session.step = 'search_people';
        yield ctx.reply("✨🔍", {
            reply_markup: (0, keyboards_1.answerFormKeyboard)()
        });
        const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
        ctx.logger.info(candidate, 'This is new candidate');
        if (candidate) {
            yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
        }
        else {
            yield (0, candidatesEnded_1.candidatesEnded)(ctx);
        }
    }
    else if (message === ctx.t('change_form')) {
        ctx.logger.info('change_form');
        ctx.session.step = 'profile';
        yield ctx.reply(ctx.t('profile_menu'), {
            reply_markup: (0, keyboards_1.profileKeyboard)()
        });
    }
    else {
        yield ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: (0, keyboards_1.allRightKeyboard)(ctx.t)
        });
    }
});
exports.allRightQuestion = allRightQuestion;
