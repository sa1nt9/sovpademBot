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
exports.searchPeopleWithLikesStep = searchPeopleWithLikesStep;
const keyboards_1 = require("../constants/keyboards");
const getOneLike_1 = require("../functions/db/getOneLike");
const saveLike_1 = require("../functions/db/saveLike");
const setMutualLike_1 = require("../functions/db/setMutualLike");
const sendForm_1 = require("../functions/sendForm");
const sendLikesNotification_1 = require("../functions/sendLikesNotification");
const sendMutualSympathyAfterAnswer_1 = require("../functions/sendMutualSympathyAfterAnswer");
function searchPeopleWithLikesStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const message = ctx.message.text;
        const userId = String(ctx.from.id);
        ctx.logger.info({ userId, action: message }, 'User in likes search');
        if (message === '❤️') {
            if (ctx.session.currentCandidateProfile) {
                const candidateId = ctx.session.currentCandidateProfile.id;
                const candidateUserId = ctx.session.currentCandidateProfile.userId;
                ctx.logger.info({ userId, candidateId, candidateUserId }, 'Creating mutual like');
                yield (0, setMutualLike_1.setMutualLike)(candidateId, ctx.session.activeProfile.id);
                yield (0, saveLike_1.saveLike)(ctx, candidateId, true, { isMutual: true });
                const userInfo = yield ctx.api.getChat(candidateUserId);
                yield (0, sendLikesNotification_1.sendLikesNotification)(ctx, candidateUserId, true);
                ctx.session.step = 'continue_see_likes_forms';
                yield ctx.reply(`${ctx.t('good_mutual_sympathy')} [${(_a = ctx.session.currentCandidateProfile.user) === null || _a === void 0 ? void 0 : _a.name}](https://t.me/${userInfo.username})`, {
                    reply_markup: (0, keyboards_1.complainToUserKeyboard)(ctx.t, String(candidateUserId)),
                    link_preview_options: {
                        is_disabled: true
                    },
                    parse_mode: 'Markdown',
                });
                const oneLike = yield (0, getOneLike_1.getOneLike)(userId, 'user');
                ctx.logger.debug({ userId, hasMoreLikes: !!oneLike }, 'Checking for more likes');
                if (oneLike === null || oneLike === void 0 ? void 0 : oneLike.fromProfile) {
                    if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
                        yield (0, sendMutualSympathyAfterAnswer_1.sendMutualSympathyAfterAnswer)(ctx, { withoutSleepMenu: true });
                    }
                    ctx.session.step = 'continue_see_forms';
                    ctx.session.additionalFormInfo.searchingLikes = false;
                    yield ctx.reply(ctx.t('continue_searching_likes'), {
                        reply_markup: (0, keyboards_1.continueKeyboard)(ctx.t)
                    });
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
            }
        }
        else if (message === '👎') {
            if (ctx.session.currentCandidateProfile) {
                const candidateId = ctx.session.currentCandidateProfile.id;
                ctx.logger.info({ userId, candidateId }, 'User disliked profile in likes search');
                yield (0, saveLike_1.saveLike)(ctx, candidateId, false);
                if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
                    yield (0, sendMutualSympathyAfterAnswer_1.sendMutualSympathyAfterAnswer)(ctx);
                    return;
                }
                const oneLike = yield (0, getOneLike_1.getOneLike)(userId, 'user');
                if (oneLike === null || oneLike === void 0 ? void 0 : oneLike.fromProfile) {
                    ctx.logger.info({ userId }, 'Showing next like');
                    ctx.session.currentCandidateProfile = oneLike.fromProfile;
                    yield (0, sendForm_1.sendForm)(ctx, oneLike.fromProfile, { myForm: false, like: oneLike });
                }
                else {
                    ctx.logger.info({ userId }, 'No more likes to show');
                    ctx.session.step = 'continue_see_forms';
                    ctx.session.additionalFormInfo.searchingLikes = false;
                    yield ctx.reply(ctx.t('its_all_go_next_question'), {
                        reply_markup: (0, keyboards_1.continueSeeFormsKeyboard)(ctx.t)
                    });
                }
            }
        }
        else if (message === '⚠️') {
            ctx.logger.info({
                userId,
                reportedUserId: (_b = ctx.session.currentCandidateProfile) === null || _b === void 0 ? void 0 : _b.userId
            }, 'User reporting profile from likes search');
            ctx.session.step = "complain";
            yield ctx.reply(ctx.t('complain_text'), {
                reply_markup: (0, keyboards_1.complainKeyboard)()
            });
        }
        else if (message === '📋') {
            ctx.logger.info({ userId }, 'User selected more options in likes search');
            ctx.session.step = 'options_to_user';
            yield ctx.reply(ctx.t('more_options_message'), {
                reply_markup: (0, keyboards_1.optionsToUserKeyboard)(ctx.t)
            });
        }
        else {
            ctx.logger.warn({ userId, message }, 'Unknown action in likes search');
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.answerLikesFormKeyboard)()
            });
        }
    });
}
