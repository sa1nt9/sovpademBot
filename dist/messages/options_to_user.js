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
exports.optionsToUserStep = optionsToUserStep;
const getCandidate_1 = require("../functions/db/getCandidate");
const candidatesEnded_1 = require("../functions/candidatesEnded");
const sendForm_1 = require("../functions/sendForm");
const keyboards_1 = require("../constants/keyboards");
const sendMutualSympathyAfterAnswer_1 = require("../functions/sendMutualSympathyAfterAnswer");
const addToBlacklist_1 = require("../functions/addToBlacklist");
const startSearchingPeople_1 = require("../functions/startSearchingPeople");
function optionsToUserStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const message = ctx.message.text;
        const userId = String(ctx.from.id);
        const candidateId = (_a = ctx.session.currentCandidateProfile) === null || _a === void 0 ? void 0 : _a.id;
        ctx.logger.info({ userId, step: 'options_to_user', action: message }, 'User selecting options for profile');
        if (message === '1. 🚫') {
            ctx.logger.info({ userId, candidateId }, 'User adding profile to blacklist');
            yield (0, addToBlacklist_1.addToBlacklist)(ctx);
        }
        else if (message === '2. ⚠️') {
            ctx.logger.info({ userId, candidateId }, 'User reporting profile');
            ctx.session.step = "complain";
            yield ctx.reply(ctx.t('complain_text'), {
                reply_markup: (0, keyboards_1.complainKeyboard)()
            });
        }
        else if (message === '3. 💤') {
            ctx.logger.info({ userId }, 'User returning to sleep menu');
            ctx.session.step = 'sleep_menu';
            yield ctx.reply(ctx.t('wait_somebody_to_see_your_form'));
            if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
                ctx.logger.info({
                    userId,
                    pendingMutualLikeProfileId: ctx.session.pendingMutualLikeProfileId
                }, 'Processing pending mutual like before sleep menu');
                yield (0, sendMutualSympathyAfterAnswer_1.sendMutualSympathyAfterAnswer)(ctx);
                return;
            }
            yield ctx.reply(ctx.t('sleep_menu'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
        else if (message === ctx.t("go_back")) {
            ctx.logger.info({ userId }, 'User returning to profile browsing');
            yield (0, startSearchingPeople_1.startSearchingPeople)(ctx);
            const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
            ctx.logger.info({ userId, candidateId: candidate === null || candidate === void 0 ? void 0 : candidate.id }, 'Retrieved next candidate after returning');
            if (candidate) {
                yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
            }
            else {
                ctx.logger.info({ userId }, 'No more candidates available');
                yield (0, candidatesEnded_1.candidatesEnded)(ctx);
            }
        }
        else {
            ctx.logger.warn({ userId, invalidOption: message }, 'User provided invalid option');
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.optionsToUserKeyboard)(ctx.t)
            });
        }
    });
}
