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
exports.continueSeeLikesForms = void 0;
const keyboards_1 = require("../constants/keyboards");
const getOneLike_1 = require("./db/getOneLike");
const sendForm_1 = require("./sendForm");
const sendMutualSympathyAfterAnswer_1 = require("./sendMutualSympathyAfterAnswer");
const continueSeeLikesForms = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const oneLike = yield (0, getOneLike_1.getOneLike)(String(ctx.from.id), 'user');
    if (oneLike === null || oneLike === void 0 ? void 0 : oneLike.fromProfile) {
        if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
            yield (0, sendMutualSympathyAfterAnswer_1.sendMutualSympathyAfterAnswer)(ctx, { withoutSleepMenu: true });
            ctx.session.step = 'continue_see_likes_forms';
            return;
        }
        yield ctx.reply("✨🔍", {
            reply_markup: (0, keyboards_1.answerLikesFormKeyboard)()
        });
        ctx.session.currentCandidateProfile = oneLike.fromProfile;
        yield (0, sendForm_1.sendForm)(ctx, oneLike.fromProfile, { myForm: false, like: oneLike });
    }
    else {
        if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
            yield (0, sendMutualSympathyAfterAnswer_1.sendMutualSympathyAfterAnswer)(ctx, { withoutSleepMenu: true });
        }
        ctx.session.step = 'continue_see_forms';
        ctx.session.additionalFormInfo.searchingLikes = false;
        yield ctx.reply(ctx.t('its_all_go_next_question'), {
            reply_markup: (0, keyboards_1.continueKeyboard)(ctx.t)
        });
    }
});
exports.continueSeeLikesForms = continueSeeLikesForms;
