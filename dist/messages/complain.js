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
const startSearchingPeople_1 = require("../functions/startSearchingPeople");
function complainStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const message = ctx.message.text || '';
        const userId = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
        const reportedUserId = ctx.session.additionalFormInfo.reportedUserId;
        ctx.logger.info({ userId, reportedUserId }, 'User in complaint menu');
        // Обработка жалоб разных типов
        if (message && message in complain_1.complainTypes) {
            const reportType = complain_1.complainTypes[message];
            ctx.logger.info({ userId, reportedUserId, reportType }, 'User selected complaint type');
            ctx.session.additionalFormInfo.reportType = reportType;
            ctx.session.step = 'complain_text';
            yield ctx.reply(ctx.t('write_complain_comment'), {
                reply_markup: (0, keyboards_1.sendComplainWithoutCommentKeyboard)(ctx.t)
            });
            return;
        }
        // Обработка отмены жалобы
        if (message === '✖️') {
            ctx.logger.info({ userId, reportedUserId }, 'User cancelled complaint');
            ctx.session.additionalFormInfo.reportedUserId = '';
            if (ctx.session.additionalFormInfo.searchingLikes) {
                ctx.logger.info({ userId }, 'Redirecting user to likes search after complaint cancellation');
                ctx.session.step = 'search_people_with_likes';
                yield (0, continueSeeLikesForms_1.continueSeeLikesForms)(ctx);
            }
            else {
                if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
                    ctx.logger.info({
                        userId,
                        pendingMutualLikeProfileId: ctx.session.pendingMutualLikeProfileId
                    }, 'Processing mutual sympathy after complaint cancellation');
                    yield (0, sendMutualSympathyAfterAnswer_1.sendMutualSympathyAfterAnswer)(ctx);
                    return;
                }
                ctx.logger.info({ userId }, 'Redirecting user to people search after complaint cancellation');
                yield (0, startSearchingPeople_1.startSearchingPeople)(ctx, { setActive: true });
                const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
                ctx.logger.debug({ userId, candidateId: candidate === null || candidate === void 0 ? void 0 : candidate.id }, 'Received new candidate after complaint cancellation');
                if (candidate) {
                    yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
                }
                else {
                    ctx.logger.info({ userId }, 'No more candidates available after complaint cancellation');
                    yield (0, candidatesEnded_1.candidatesEnded)(ctx);
                }
            }
        }
        else {
            ctx.logger.warn({ userId, message, reportedUserId }, 'User sent unexpected message in complaint menu');
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.complainKeyboard)()
            });
        }
    });
}
