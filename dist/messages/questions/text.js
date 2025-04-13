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
exports.textQuestion = void 0;
const keyboards_1 = require("../../constants/keyboards");
const hasLinks_1 = require("../../functions/hasLinks");
const saveUser_1 = require("../../functions/db/saveUser");
const sendForm_1 = require("../../functions/sendForm");
const profilesService_1 = require("../../functions/db/profilesService");
const textQuestion = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const message = ctx.message.text;
    const userId = String(ctx.from.id);
    ctx.logger.info({
        userId,
        question: 'text',
        input: message,
        profileType: (_a = ctx.session.activeProfile) === null || _a === void 0 ? void 0 : _a.profileType,
        editingMode: !!ctx.session.additionalFormInfo.canGoBack
    }, 'User answering profile description question');
    if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
        ctx.logger.info({ userId }, 'User returning to profile from text edit');
        ctx.session.question = "years";
        ctx.session.step = 'profile';
        ctx.session.isEditingProfile = false;
        ctx.session.additionalFormInfo.canGoBack = false;
        yield (0, sendForm_1.sendForm)(ctx);
        yield ctx.reply(ctx.t('profile_menu'), {
            reply_markup: (0, keyboards_1.profileKeyboard)()
        });
    }
    else if (message && message.length > 1000) {
        ctx.logger.warn({ userId, textLength: message.length }, 'User description too long');
        yield ctx.reply(ctx.t('long_text'), {
            reply_markup: (0, keyboards_1.textKeyboard)(ctx.t, ctx.session)
        });
    }
    else if ((0, hasLinks_1.hasLinks)(message || "")) {
        ctx.logger.warn({ userId }, 'User description contains links');
        yield ctx.reply(ctx.t('this_text_breaks_the_rules'), {
            reply_markup: (0, keyboards_1.textKeyboard)(ctx.t, ctx.session)
        });
    }
    else {
        if (message !== ctx.t('leave_current')) {
            const isSkipped = !message || message === ctx.t('skip');
            ctx.logger.info({
                userId,
                textLength: (message === null || message === void 0 ? void 0 : message.length) || 0,
                skipped: isSkipped
            }, 'User description validated and saved');
            ctx.session.activeProfile.description = isSkipped ? "" : message;
        }
        else {
            ctx.logger.info({ userId }, 'User keeping current description');
        }
        if (ctx.session.additionalFormInfo.canGoBack) {
            ctx.logger.info({ userId }, 'Saving profile after text edit and returning to main menu');
            ctx.session.question = "years";
            ctx.session.step = 'profile';
            ctx.session.additionalFormInfo.canGoBack = false;
            yield (0, saveUser_1.saveUser)(ctx, { onlyProfile: true });
            yield (0, sendForm_1.sendForm)(ctx);
            yield ctx.reply(ctx.t('profile_menu'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
        else {
            ctx.logger.info({ userId }, 'Proceeding to file upload stage');
            ctx.session.question = "file";
            const profile = yield (0, profilesService_1.getUserProfile)(String(ctx.message.from.id), ctx.session.activeProfile.profileType, ctx.session.activeProfile.subType);
            const files = (profile === null || profile === void 0 ? void 0 : profile.files) || [];
            yield ctx.reply(ctx.t('file_question'), {
                reply_markup: (0, keyboards_1.fileKeyboard)(ctx.t, ctx.session, files.length > 0)
            });
        }
    }
});
exports.textQuestion = textQuestion;
