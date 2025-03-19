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
exports.continueSeeLikesFormsStep = continueSeeLikesFormsStep;
const keyboards_1 = require("../constants/keyboards");
const getCandidate_1 = require("../functions/db/getCandidate");
const getOneLike_1 = require("../functions/db/getOneLike");
const sendForm_1 = require("../functions/sendForm");
function continueSeeLikesFormsStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        ctx.session.step = 'search_people_with_likes';
        ctx.session.additionalFormInfo.searchingLikes = true;
        const oneLike = yield (0, getOneLike_1.getOneLike)(String(ctx.from.id));
        if (oneLike === null || oneLike === void 0 ? void 0 : oneLike.user) {
            yield ctx.reply("✨🔍", {
                reply_markup: (0, keyboards_1.answerLikesFormKeyboard)()
            });
            yield (0, sendForm_1.sendForm)(ctx, oneLike.user, { myForm: false, like: oneLike });
        }
        else {
            ctx.session.step = 'search_people';
            ctx.session.additionalFormInfo.searchingLikes = false;
            yield ctx.reply("✨🔍", {
                reply_markup: (0, keyboards_1.answerFormKeyboard)()
            });
            const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
            ctx.logger.info(candidate, 'This is new candidate');
            yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
        }
    });
}
