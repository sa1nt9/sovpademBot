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
const complain_1 = require("../constants/complain");
const keyboards_1 = require("../constants/keyboards");
const continueSeeLikesForms_1 = require("../functions/continueSeeLikesForms");
const candidatesEnded_1 = require("../functions/candidatesEnded");
const getCandidate_1 = require("../functions/db/getCandidate");
const sendForm_1 = require("../functions/sendForm");
const sendMutualSympathyAfterAnswer_1 = require("../functions/sendMutualSympathyAfterAnswer");
function complainStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = ctx.message.text || '';
        // Обработка жалоб разных типов
        if (message && message in complain_1.complainTypes) {
            ctx.session.additionalFormInfo.reportType = complain_1.complainTypes[message];
            ctx.session.step = 'complain_text';
            yield ctx.reply(ctx.t('write_complain_comment'), {
                reply_markup: (0, keyboards_1.sendComplainWithoutCommentKeyboard)(ctx.t)
            });
            return;
        }
        // Обработка отмены жалобы
        if (message === '✖️') {
            ctx.session.additionalFormInfo.reportedUserId = '';
            if (ctx.session.additionalFormInfo.searchingLikes) {
                ctx.session.step = 'search_people_with_likes';
                yield (0, continueSeeLikesForms_1.continueSeeLikesForms)(ctx);
            }
            else {
                ctx.session.step = 'search_people';
                if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeUserId) {
                    yield (0, sendMutualSympathyAfterAnswer_1.sendMutualSympathyAfterAnswer)(ctx);
                    return;
                }
                yield ctx.reply("✨🔍", {
                    reply_markup: (0, keyboards_1.answerFormKeyboard)()
                });
                const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
                if (candidate) {
                    yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
                }
                else {
                    yield (0, candidatesEnded_1.candidatesEnded)(ctx);
                }
            }
        }
        else {
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.complainKeyboard)()
            });
        }
    });
}
