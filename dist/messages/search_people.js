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
exports.searchPeopleStep = searchPeopleStep;
const keyboards_1 = require("../constants/keyboards");
const getCandidate_1 = require("../functions/db/getCandidate");
const saveLike_1 = require("../functions/db/saveLike");
const sendForm_1 = require("../functions/sendForm");
const sendLikesNotification_1 = require("../functions/sendLikesNotification");
const sendMutualSympathyAfterAnswer_1 = require("../functions/sendMutualSympathyAfterAnswer");
const candidatesEnded_1 = require("../functions/candidatesEnded");
function searchPeopleStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = ctx.message.text;
        if (message === '❤️') {
            if (ctx.session.currentCandidateProfile) {
                ctx.logger.info(ctx.session.currentCandidateProfile, '❤️');
                yield (0, saveLike_1.saveLike)(ctx, ctx.session.currentCandidateProfile.id, true);
                yield (0, sendLikesNotification_1.sendLikesNotification)(ctx, ctx.session.currentCandidateProfile.userId);
                // Проверяем наличие отложенной взаимной симпатии
                if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
                    yield (0, sendMutualSympathyAfterAnswer_1.sendMutualSympathyAfterAnswer)(ctx);
                    return;
                }
            }
            const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
            ctx.logger.info(candidate, 'This is new candidate');
            if (candidate) {
                yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
            }
            else {
                yield (0, candidatesEnded_1.candidatesEnded)(ctx);
            }
        }
        else if (message === '💌/📹') {
            ctx.session.step = 'text_or_video_to_user';
            ctx.session.additionalFormInfo.awaitingLikeContent = true;
            yield ctx.reply(ctx.t('text_or_video_to_user'), {
                reply_markup: (0, keyboards_1.textOrVideoKeyboard)(ctx.t)
            });
        }
        else if (message === '👎') {
            if (ctx.session.currentCandidateProfile) {
                yield (0, saveLike_1.saveLike)(ctx, ctx.session.currentCandidateProfile.id, false);
                if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
                    yield (0, sendMutualSympathyAfterAnswer_1.sendMutualSympathyAfterAnswer)(ctx);
                    return;
                }
            }
            const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
            ctx.logger.info(candidate, 'This is new candidate');
            if (candidate) {
                yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
            }
            else {
                yield (0, candidatesEnded_1.candidatesEnded)(ctx);
            }
        }
        else if (message === '📋') {
            ctx.session.step = 'options_to_user';
            yield ctx.reply(ctx.t('more_options_message'), {
                reply_markup: (0, keyboards_1.optionsToUserKeyboard)(ctx.t)
            });
        }
        else {
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.answerFormKeyboard)()
            });
        }
    });
}
