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
exports.profileStep = profileStep;
const keyboards_1 = require("../constants/keyboards");
const getCandidate_1 = require("../functions/db/getCandidate");
const sendForm_1 = require("../functions/sendForm");
const roulette_start_1 = require("./roulette_start");
const candidatesEnded_1 = require("../functions/candidatesEnded");
function profileStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = ctx.message.text;
        if (message === '1 🚀') {
            ctx.session.step = 'search_people';
            yield ctx.reply("✨🔍", {
                reply_markup: (0, keyboards_1.answerFormKeyboard)(),
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
        else if (message === '2') {
            ctx.session.step = 'questions';
            ctx.session.question = 'years';
            yield ctx.reply(ctx.t('years_question'), {
                reply_markup: (0, keyboards_1.ageKeyboard)(ctx.session)
            });
        }
        else if (message === '3') {
            ctx.session.step = 'questions';
            ctx.session.question = 'file';
            ctx.session.additionalFormInfo.canGoBack = true;
            yield ctx.reply(ctx.t('file_question'), {
                reply_markup: (0, keyboards_1.fileKeyboard)(ctx.t, ctx.session, true)
            });
        }
        else if (message === '4') {
            ctx.session.step = 'questions';
            ctx.session.question = "text";
            ctx.session.additionalFormInfo.canGoBack = true;
            yield ctx.reply(ctx.t('text_question'), {
                reply_markup: (0, keyboards_1.textKeyboard)(ctx.t, ctx.session)
            });
        }
        else if (message === '5 🎲') {
            ctx.session.step = 'roulette_start';
            yield (0, roulette_start_1.showRouletteStart)(ctx);
        }
        else {
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
    });
}
