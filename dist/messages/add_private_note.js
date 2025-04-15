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
exports.addPrivateNoteStep = addPrivateNoteStep;
const keyboards_1 = require("../constants/keyboards");
function addPrivateNoteStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const message = ctx.message.text;
        const userId = String(ctx.from.id);
        const candidateId = (_a = ctx.session.currentCandidateProfile) === null || _a === void 0 ? void 0 : _a.id;
        ctx.logger.info({ userId, step: 'add_private_note', candidateId }, 'User adding private note to like');
        if (message === ctx.t('back')) {
            ctx.logger.info({ userId }, 'User cancelled private note creation');
            ctx.session.step = 'text_or_video_to_user';
            yield ctx.reply(ctx.t('text_or_video_to_user'), {
                reply_markup: (0, keyboards_1.textOrVideoKeyboard)(ctx.t)
            });
            return;
        }
        else if (message && message.length > 400) {
            ctx.logger.warn({ userId, messageLength: message.length }, 'Private note too long');
            yield ctx.reply(ctx.t('private_note_max_length'));
            return;
        }
        else if (!message) {
            ctx.logger.warn({ userId }, 'User sent empty message for private note');
            yield ctx.reply(ctx.t('write_text_note'), {
                reply_markup: (0, keyboards_1.goBackKeyboard)(ctx.t)
            });
        }
        else {
            ctx.logger.info({
                userId,
                candidateId,
                noteLength: message.length
            }, 'User successfully added private note');
            ctx.session.privateNote = message;
            ctx.session.step = 'added_private_note';
            yield ctx.reply(ctx.t('after_note_you_want_to_add_text_to_user'), {
                reply_markup: (0, keyboards_1.skipKeyboard)(ctx.t, true),
                parse_mode: 'Markdown'
            });
        }
    });
}
