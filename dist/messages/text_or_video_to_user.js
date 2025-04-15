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
const candidatesEnded_1 = require("../functions/candidatesEnded");
const getCandidate_1 = require("../functions/db/getCandidate");
const saveLike_1 = require("../functions/db/saveLike");
const hasLinks_1 = require("../functions/hasLinks");
const sendForm_1 = require("../functions/sendForm");
const sendLikesNotification_1 = require("../functions/sendLikesNotification");
const sendMutualSympathyAfterAnswer_1 = require("../functions/sendMutualSympathyAfterAnswer");
const startSearchingPeople_1 = require("../functions/startSearchingPeople");
function textOrVideoToUserStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const message = ctx.message.text;
        const userId = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
        ctx.logger.info({ userId }, 'User in message sending menu');
        if (!ctx.session.currentCandidateProfile) {
            ctx.logger.warn({ userId }, 'No current candidate profile for message');
            ctx.session.step = 'search_people';
            yield ctx.reply(ctx.t('operation_cancelled'), {
                reply_markup: (0, keyboards_1.answerFormKeyboard)()
            });
            const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
            if (candidate) {
                yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
            }
            else {
                yield (0, candidatesEnded_1.candidatesEnded)(ctx);
            }
            return;
        }
        const candidateId = ctx.session.currentCandidateProfile.id;
        const candidateUserId = ctx.session.currentCandidateProfile.userId;
        ctx.logger.info({ userId, candidateId }, 'Processing message to candidate');
        let isPrivateNote = ctx.session.step === 'added_private_note';
        if (isPrivateNote && message === ctx.t('skip')) {
            ctx.logger.info({ userId, candidateId }, 'User skipped additional note');
            yield (0, saveLike_1.saveLike)(ctx, candidateId, true, {
                privateNote: ctx.session.privateNote
            });
            yield (0, sendLikesNotification_1.sendLikesNotification)(ctx, candidateUserId);
        }
        else {
            if (message === ctx.t('go_back')) {
                ctx.logger.info({ userId }, 'User cancelled message sending');
                yield (0, startSearchingPeople_1.startSearchingPeople)(ctx, { setActive: true });
                const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
                if (candidate) {
                    yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
                }
                else {
                    yield (0, candidatesEnded_1.candidatesEnded)(ctx);
                }
                return;
            }
            else if (message === ctx.t('add_private_note') && !isPrivateNote) {
                ctx.logger.info({ userId, candidateId }, 'User adding private note');
                ctx.session.step = 'add_private_note';
                yield ctx.reply(ctx.t('add_private_note_message'), {
                    reply_markup: (0, keyboards_1.goBackKeyboard)(ctx.t)
                });
                return;
            }
            const video = (_b = ctx.message) === null || _b === void 0 ? void 0 : _b.video;
            const voice = (_c = ctx.message) === null || _c === void 0 ? void 0 : _c.voice;
            const videoNote = (_d = ctx.message) === null || _d === void 0 ? void 0 : _d.video_note;
            if (video) {
                ctx.logger.info({ userId, candidateId, duration: video.duration }, 'User sending video');
                if (video.duration && video.duration > 15) {
                    ctx.logger.warn({ userId, duration: video.duration }, 'Video too long');
                    yield ctx.reply(ctx.t('video_must_be_less_15'));
                    return;
                }
                yield (0, saveLike_1.saveLike)(ctx, candidateId, true, {
                    videoFileId: video.file_id,
                    privateNote: isPrivateNote ? ctx.session.privateNote : undefined
                });
                yield (0, sendLikesNotification_1.sendLikesNotification)(ctx, candidateUserId);
            }
            else if (voice) {
                ctx.logger.info({ userId, candidateId, duration: voice.duration }, 'User sending voice message');
                if (voice.duration && voice.duration > 60) {
                    ctx.logger.warn({ userId, duration: voice.duration }, 'Voice message too long');
                    yield ctx.reply(ctx.t('voice_must_be_less_60'));
                    return;
                }
                yield (0, saveLike_1.saveLike)(ctx, candidateId, true, {
                    voiceFileId: voice.file_id,
                    privateNote: isPrivateNote ? ctx.session.privateNote : undefined
                });
                yield (0, sendLikesNotification_1.sendLikesNotification)(ctx, candidateUserId);
            }
            else if (videoNote) {
                ctx.logger.info({ userId, candidateId }, 'User sending video note');
                yield (0, saveLike_1.saveLike)(ctx, candidateId, true, {
                    videoNoteFileId: videoNote.file_id,
                    privateNote: isPrivateNote ? ctx.session.privateNote : undefined
                });
                yield (0, sendLikesNotification_1.sendLikesNotification)(ctx, candidateUserId);
            }
            else if (message) {
                ctx.logger.info({ userId, candidateId, messageLength: message.length }, 'User sending text message');
                if (message.length > 400) {
                    ctx.logger.warn({ userId, messageLength: message.length }, 'Message too long');
                    yield ctx.reply(ctx.t('long_message'));
                    return;
                }
                else if ((0, hasLinks_1.hasLinks)(message)) {
                    ctx.logger.warn({ userId }, 'Message contains links');
                    yield ctx.reply(ctx.t('this_text_breaks_the_rules'));
                    return;
                }
                yield (0, saveLike_1.saveLike)(ctx, candidateId, true, {
                    message: message,
                    privateNote: isPrivateNote ? ctx.session.privateNote : undefined
                });
                yield (0, sendLikesNotification_1.sendLikesNotification)(ctx, candidateUserId);
            }
            else {
                ctx.logger.warn({ userId }, 'Invalid message type');
                yield ctx.reply(ctx.t('not_message_and_not_video'));
            }
        }
        ctx.logger.info({ userId, candidateId }, 'Message sent successfully');
        ctx.session.step = 'search_people';
        yield ctx.reply(ctx.t('like_sended_wait_for_answer'), {
            reply_markup: {
                remove_keyboard: true
            }
        });
        if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
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
    });
}
