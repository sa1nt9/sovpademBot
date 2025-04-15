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
exports.somebodysLikedYouStep = somebodysLikedYouStep;
const keyboards_1 = require("../constants/keyboards");
const getOneLike_1 = require("../functions/db/getOneLike");
const profilesService_1 = require("../functions/db/profilesService");
const sendForm_1 = require("../functions/sendForm");
function somebodysLikedYouStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = ctx.message.text;
        const userId = String(ctx.from.id);
        ctx.logger.info({ userId }, 'Processing likes notification');
        if (message === '1 👍') {
            ctx.session.step = 'search_people_with_likes';
            ctx.session.additionalFormInfo.searchingLikes = true;
            const oneLike = yield (0, getOneLike_1.getOneLike)(userId, 'user');
            ctx.session.currentCandidateProfile = oneLike === null || oneLike === void 0 ? void 0 : oneLike.fromProfile;
            yield ctx.reply("✨🔍", {
                reply_markup: (0, keyboards_1.answerLikesFormKeyboard)()
            });
            if (oneLike === null || oneLike === void 0 ? void 0 : oneLike.fromProfile) {
                yield (0, sendForm_1.sendForm)(ctx, oneLike.fromProfile.user, { myForm: false, like: oneLike });
                ctx.logger.info({ userId, likesCount: 1 }, 'Sent likes notification');
            }
        }
        else if (message === '2 💤') {
            ctx.session.step = 'disable_form';
            const profiles = yield (0, profilesService_1.getUserProfiles)(userId, ctx);
            yield ctx.reply(ctx.t('are_you_sure_you_want_to_disable_your_form'), {
                reply_markup: (0, keyboards_1.deactivateProfileKeyboard)(ctx.t, profiles)
            });
        }
        else {
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.somebodysLikedYouKeyboard)()
            });
        }
    });
}
