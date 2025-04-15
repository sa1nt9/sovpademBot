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
exports.fileQuestion = void 0;
const keyboards_1 = require("../../constants/keyboards");
const saveUser_1 = require("../../functions/db/saveUser");
const sendForm_1 = require("../../functions/sendForm");
const profilesService_1 = require("../../functions/db/profilesService");
const fileQuestion = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const message = ctx.message.text;
    const userId = String(ctx.from.id);
    ctx.logger.info({
        userId,
        question: 'file',
        input: message,
        hasPhoto: !!((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.photo),
        hasVideo: !!((_b = ctx.message) === null || _b === void 0 ? void 0 : _b.video),
        profileType: (_c = ctx.session.activeProfile) === null || _c === void 0 ? void 0 : _c.profileType
    }, 'User at file upload stage');
    if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
        ctx.logger.info({ userId }, 'User cancelling file upload and returning to profile');
        ctx.session.activeProfile.tempFiles = [];
        ctx.session.question = "years";
        ctx.session.step = 'profile';
        ctx.session.isEditingProfile = false;
        ctx.session.additionalFormInfo.canGoBack = false;
        yield (0, sendForm_1.sendForm)(ctx);
        yield ctx.reply(ctx.t('profile_menu'), {
            reply_markup: (0, keyboards_1.profileKeyboard)()
        });
    }
    else {
        const profile = yield (0, profilesService_1.getUserProfile)(String(ctx.message.from.id), ctx.session.activeProfile.profileType, ctx.session.activeProfile.subType);
        const files = (profile === null || profile === void 0 ? void 0 : profile.files) || [];
        if (message === ctx.t("leave_current_m") && (profile === null || profile === void 0 ? void 0 : profile.files) && files.length > 0) {
            ctx.logger.info({ userId, filesCount: files.length }, 'User keeping current files');
            yield (0, saveUser_1.saveUser)(ctx, { onlyProfile: ctx.session.additionalFormInfo.canGoBack });
            yield (0, sendForm_1.sendForm)(ctx);
            ctx.session.additionalFormInfo.canGoBack = false;
            ctx.session.question = "all_right";
            yield ctx.reply(ctx.t('all_right_question'), {
                reply_markup: (0, keyboards_1.allRightKeyboard)(ctx.t)
            });
        }
        else {
            const isImage = (_d = ctx.message) === null || _d === void 0 ? void 0 : _d.photo;
            const isVideo = (_e = ctx.message) === null || _e === void 0 ? void 0 : _e.video;
            if (isVideo && ((_g = (_f = ctx.message) === null || _f === void 0 ? void 0 : _f.video) === null || _g === void 0 ? void 0 : _g.duration) && ((_j = (_h = ctx.message) === null || _h === void 0 ? void 0 : _h.video) === null || _j === void 0 ? void 0 : _j.duration) > 15) {
                ctx.logger.warn({
                    userId,
                    videoDuration: ctx.message.video.duration
                }, 'Video exceeds maximum duration');
                yield ctx.reply(ctx.t('video_must_be_less_15'), {
                    reply_markup: (0, keyboards_1.fileKeyboard)(ctx.t, ctx.session, files.length > 0)
                });
            }
            else if (isImage || isVideo) {
                const file = ctx.message.photo ? ctx.message.photo[ctx.message.photo.length - 1] : ctx.message.video;
                const fileType = isImage ? 'photo' : 'video';
                ctx.logger.info({
                    userId,
                    fileType,
                    fileId: file === null || file === void 0 ? void 0 : file.file_id
                }, 'User uploaded media file');
                ctx.session.activeProfile.tempFiles = [{ type: fileType, media: (file === null || file === void 0 ? void 0 : file.file_id) || '' }];
                ctx.session.question = "add_another_file";
                yield ctx.reply(ctx.t(isImage ? 'photo_added' : "video_added", { uploaded: 1 }), {
                    reply_markup: (0, keyboards_1.someFilesAddedKeyboard)(ctx.t, ctx.session)
                });
            }
            else {
                ctx.logger.warn({ userId }, 'User sent invalid media type or text');
                yield ctx.reply(ctx.t('second_file_question'), {
                    reply_markup: (0, keyboards_1.fileKeyboard)(ctx.t, ctx.session, files.length > 0)
                });
            }
        }
    }
});
exports.fileQuestion = fileQuestion;
