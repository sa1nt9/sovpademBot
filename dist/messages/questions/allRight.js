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
const startSearchingPeople_1 = require("../../functions/startSearchingPeople");
const allRightQuestion = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const message = ctx.message.text;
    const userId = String(ctx.from.id);
    ctx.logger.info({
        userId,
        question: 'all_right',
        input: message,
        profileType: (_a = ctx.session.activeProfile) === null || _a === void 0 ? void 0 : _a.profileType
    }, 'User at final profile confirmation stage');
    if (message === ctx.t("yes")) {
        ctx.logger.info({ userId }, 'User confirmed profile and ready to browse matches');
        yield (0, startSearchingPeople_1.startSearchingPeople)(ctx, { setActive: true });
        const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
        ctx.logger.info({ userId, candidateId: candidate === null || candidate === void 0 ? void 0 : candidate.id }, 'First candidate after profile completion');
        if (candidate) {
            yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
        }
        else {
            ctx.logger.info({ userId }, 'No candidates available after profile completion');
            yield (0, candidatesEnded_1.candidatesEnded)(ctx);
        }
    }
    else if (message === ctx.t('change_form')) {
        ctx.logger.info({ userId }, 'User wants to change profile before browsing');
        ctx.session.step = 'profile';
        yield ctx.reply(ctx.t('profile_menu'), {
            reply_markup: (0, keyboards_1.profileKeyboard)()
        });
    }
    else {
        ctx.logger.warn({ userId, invalidOption: message }, 'User provided invalid response at confirmation');
        yield ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: (0, keyboards_1.allRightKeyboard)(ctx.t)
        });
    }
});
exports.allRightQuestion = allRightQuestion;
