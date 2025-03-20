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
exports.textOrVideoToUserStep = textOrVideoToUserStep;
const keyboards_1 = require("../constants/keyboards");
const getCandidate_1 = require("../functions/db/getCandidate");
const saveLike_1 = require("../functions/db/saveLike");
const sendForm_1 = require("../functions/sendForm");
const sendLikesNotification_1 = require("../functions/sendLikesNotification");
const sendMutualSympathyAfterAnswer_1 = require("../functions/sendMutualSympathyAfterAnswer");
function textOrVideoToUserStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const message = ctx.message.text;
        if (!ctx.session.currentCandidate || !ctx.session.additionalFormInfo.awaitingLikeContent) {
            ctx.session.step = 'search_people';
            yield ctx.reply(ctx.t('operation_cancelled'), {
                reply_markup: (0, keyboards_1.answerFormKeyboard)()
            });
            const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
            yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
            ctx.logger.info(candidate, 'This is new candidate');
            return;
        }
        if (message === ctx.t('go_back')) {
            ctx.session.step = 'search_people';
            ctx.session.question = 'years';
            ctx.session.additionalFormInfo.awaitingLikeContent = false;
            yield ctx.reply("✨🔍", {
                reply_markup: (0, keyboards_1.answerFormKeyboard)()
            });
            const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
            ctx.logger.info(candidate, 'This is new candidate');
            yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
            return;
        }
        const isVideo = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.video;
        if (isVideo) {
            if (((_b = ctx.message.video) === null || _b === void 0 ? void 0 : _b.duration) && ctx.message.video.duration > 15) {
                yield ctx.reply(ctx.t('video_must_be_less_15'));
                return;
            }
            yield (0, saveLike_1.saveLike)(ctx, ctx.session.currentCandidate.id, true, {
                videoFileId: (_c = ctx.message.video) === null || _c === void 0 ? void 0 : _c.file_id
            });
            yield (0, sendLikesNotification_1.sendLikesNotification)(ctx, ctx.session.currentCandidate.id);
        }
        else if (message) {
            yield (0, saveLike_1.saveLike)(ctx, ctx.session.currentCandidate.id, true, {
                message: message
            });
            yield (0, sendLikesNotification_1.sendLikesNotification)(ctx, ctx.session.currentCandidate.id);
        }
        else {
            yield ctx.reply(ctx.t('not_message_and_not_video'));
        }
        ctx.session.step = 'search_people';
        ctx.session.additionalFormInfo.awaitingLikeContent = false;
        yield ctx.reply(ctx.t('like_sended_wait_for_answer'), {
            reply_markup: {
                remove_keyboard: true
            }
        });
        if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeUserId) {
            yield (0, sendMutualSympathyAfterAnswer_1.sendMutualSympathyAfterAnswer)(ctx);
            return;
        }
        yield ctx.reply("✨🔍", {
            reply_markup: (0, keyboards_1.answerFormKeyboard)()
        });
        const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
        yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
        ctx.logger.info(candidate, 'This is new candidate');
    });
}
