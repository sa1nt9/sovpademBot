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
exports.addAnotherFileQuestion = void 0;
const keyboards_1 = require("../../constants/keyboards");
const saveUser_1 = require("../../functions/db/saveUser");
const sendForm_1 = require("../../functions/sendForm");
const profilesService_1 = require("../../functions/db/profilesService");
const addAnotherFileQuestion = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const message = ctx.message.text;
    const userId = String(ctx.from.id);
    ctx.logger.info({
        userId,
        question: 'add_another_file',
        input: message,
        hasPhoto: !!((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.photo),
        hasVideo: !!((_b = ctx.message) === null || _b === void 0 ? void 0 : _b.video),
        currentFilesCount: ((_c = ctx.session.activeProfile.tempFiles) === null || _c === void 0 ? void 0 : _c.length) || 0,
        profileType: (_d = ctx.session.activeProfile) === null || _d === void 0 ? void 0 : _d.profileType
    }, 'User at additional file upload stage');
    if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
        ctx.logger.info({ userId }, 'User cancelled additional file upload and returning to profile');
        ctx.session.activeProfile.tempFiles = [];
        ctx.session.step = 'profile';
        ctx.session.isEditingProfile = false;
        ctx.session.additionalFormInfo.canGoBack = false;
        yield (0, sendForm_1.sendForm)(ctx);
        yield ctx.reply(ctx.t('profile_menu'), {
            reply_markup: (0, keyboards_1.profileKeyboard)()
        });
    }
    else if (message === ctx.t("its_all_save_files")) {
        ctx.logger.info({
            userId,
            filesCount: ((_e = ctx.session.activeProfile.tempFiles) === null || _e === void 0 ? void 0 : _e.length) || 0
        }, 'User finished file upload, saving files');
        if (ctx.session.additionalFormInfo.canGoBack) {
            ctx.logger.info({ userId }, 'Returning to profile after file upload in edit mode');
            ctx.session.step = 'profile';
            ctx.session.activeProfile.files = ctx.session.activeProfile.tempFiles || [];
            ctx.session.activeProfile.tempFiles = [];
            ctx.session.additionalFormInfo.canGoBack = false;
            yield (0, saveUser_1.saveUser)(ctx, { onlyProfile: true });
            yield (0, sendForm_1.sendForm)(ctx);
            yield ctx.reply(ctx.t('profile_menu'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
        else {
            ctx.logger.info({ userId }, 'Proceeding to final confirmation after file upload');
            ctx.session.question = "all_right";
            ctx.session.activeProfile.files = ctx.session.activeProfile.tempFiles || [];
            ctx.session.activeProfile.tempFiles = [];
            ctx.session.additionalFormInfo.canGoBack = false;
            yield (0, saveUser_1.saveUser)(ctx);
            yield (0, sendForm_1.sendForm)(ctx);
            yield ctx.reply(ctx.t('all_right_question'), {
                reply_markup: (0, keyboards_1.allRightKeyboard)(ctx.t)
            });
        }
    }
    else {
        const isImage = (_f = ctx.message) === null || _f === void 0 ? void 0 : _f.photo;
        const isVideo = (_g = ctx.message) === null || _g === void 0 ? void 0 : _g.video;
        if (isVideo && ((_j = (_h = ctx.message) === null || _h === void 0 ? void 0 : _h.video) === null || _j === void 0 ? void 0 : _j.duration) && ((_l = (_k = ctx.message) === null || _k === void 0 ? void 0 : _k.video) === null || _l === void 0 ? void 0 : _l.duration) > 15) {
            ctx.logger.warn({
                userId,
                videoDuration: ctx.message.video.duration
            }, 'Additional video exceeds maximum duration');
            yield ctx.reply(ctx.t('video_must_be_less_15'), {
                reply_markup: (0, keyboards_1.someFilesAddedKeyboard)(ctx.t, ctx.session)
            });
        }
        else if (isImage || isVideo) {
            const file = ctx.message.photo ? ctx.message.photo[ctx.message.photo.length - 1] : ctx.message.video;
            const fileType = isImage ? 'photo' : 'video';
            ctx.logger.info({
                userId,
                fileType,
                fileId: file === null || file === void 0 ? void 0 : file.file_id,
                fileNumber: (((_m = ctx.session.activeProfile.tempFiles) === null || _m === void 0 ? void 0 : _m.length) || 0) + 1
            }, 'User uploaded additional media file');
            (_o = ctx.session.activeProfile.tempFiles) === null || _o === void 0 ? void 0 : _o.push({ type: fileType, media: (file === null || file === void 0 ? void 0 : file.file_id) || '' });
            if (((_p = ctx.session.activeProfile.tempFiles) === null || _p === void 0 ? void 0 : _p.length) === 2) {
                ctx.logger.info({ userId, filesCount: 2 }, 'User reached maximum number of files');
                yield ctx.reply(ctx.t(isImage ? 'photo_added' : "video_added", { uploaded: 2 }), {
                    reply_markup: (0, keyboards_1.someFilesAddedKeyboard)(ctx.t, ctx.session)
                });
            }
            else {
                ctx.logger.info({ userId }, 'Automatically proceeding with max files reached');
                if (ctx.session.additionalFormInfo.canGoBack) {
                    ctx.logger.info({ userId }, 'Returning to profile with new files in edit mode');
                    ctx.session.step = 'profile';
                    ctx.session.activeProfile.files = ctx.session.activeProfile.tempFiles || [];
                    ctx.session.activeProfile.tempFiles = [];
                    ctx.session.additionalFormInfo.canGoBack = false;
                    yield (0, saveUser_1.saveUser)(ctx, { onlyProfile: true });
                    yield (0, sendForm_1.sendForm)(ctx);
                    yield ctx.reply(ctx.t('profile_menu'), {
                        reply_markup: (0, keyboards_1.profileKeyboard)()
                    });
                }
                else {
                    ctx.logger.info({ userId }, 'Proceeding to final confirmation with new files');
                    ctx.session.question = "all_right";
                    ctx.session.activeProfile.files = ctx.session.activeProfile.tempFiles || [];
                    ctx.session.activeProfile.tempFiles = [];
                    yield (0, saveUser_1.saveUser)(ctx);
                    yield (0, sendForm_1.sendForm)(ctx);
                    yield ctx.reply(ctx.t('all_right_question'), {
                        reply_markup: (0, keyboards_1.allRightKeyboard)(ctx.t)
                    });
                }
            }
        }
        else {
            ctx.logger.warn({ userId, message }, 'User sent invalid media type or text');
            const profile = yield (0, profilesService_1.getUserProfile)(String(ctx.message.from.id), ctx.session.activeProfile.profileType, ctx.session.activeProfile.subType);
            const files = (profile === null || profile === void 0 ? void 0 : profile.files) || [];
            yield ctx.reply(ctx.t('second_file_question'), {
                reply_markup: (0, keyboards_1.fileKeyboard)(ctx.t, ctx.session, files.length > 0)
            });
        }
    }
});
exports.addAnotherFileQuestion = addAnotherFileQuestion;
