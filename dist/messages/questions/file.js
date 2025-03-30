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
const saveForm_1 = require("../../functions/db/saveForm");
const sendForm_1 = require("../../functions/sendForm");
const postgres_1 = require("../../db/postgres");
const fileQuestion = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const message = ctx.message.text;
    if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
        ctx.session.activeProfile.tempFiles = [];
        ctx.session.question = "years";
        ctx.session.step = 'profile';
        ctx.session.additionalFormInfo.canGoBack = false;
        yield (0, sendForm_1.sendForm)(ctx);
        yield ctx.reply(ctx.t('profile_menu'), {
            reply_markup: (0, keyboards_1.profileKeyboard)()
        });
    }
    else {
        const user = yield postgres_1.prisma.user.findUnique({
            where: { id: String(ctx.message.from.id) },
            // select: { files: true },
        });
        // const files = user?.files ? JSON.parse(user?.files as any) : []
        const files = [];
        if (message === ctx.t("leave_current_m") && (user === null || user === void 0 ? void 0 : user.files) && files.length > 0) {
            ctx.logger.info('leave_current_m');
            yield (0, saveForm_1.saveForm)(ctx);
            yield (0, sendForm_1.sendForm)(ctx);
            ctx.session.question = "all_right";
            ctx.logger.info({ question: ctx.session.question }, 'all_right');
            yield ctx.reply(ctx.t('all_right_question'), {
                reply_markup: (0, keyboards_1.allRightKeyboard)(ctx.t)
            });
        }
        else {
            const isImage = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.photo;
            const isVideo = (_b = ctx.message) === null || _b === void 0 ? void 0 : _b.video;
            if (isVideo && ((_d = (_c = ctx.message) === null || _c === void 0 ? void 0 : _c.video) === null || _d === void 0 ? void 0 : _d.duration) && ((_f = (_e = ctx.message) === null || _e === void 0 ? void 0 : _e.video) === null || _f === void 0 ? void 0 : _f.duration) < 15) {
                yield ctx.reply(ctx.t('video_must_be_less_15'), {
                    reply_markup: (0, keyboards_1.fileKeyboard)(ctx.t, ctx.session, files.length > 0)
                });
            }
            else if (isImage || isVideo) {
                const file = ctx.message.photo ? ctx.message.photo[ctx.message.photo.length - 1] : ctx.message.video;
                ctx.session.activeProfile.tempFiles = [{ type: isImage ? 'photo' : 'video', media: (file === null || file === void 0 ? void 0 : file.file_id) || '' }];
                ctx.session.question = "add_another_file";
                yield ctx.reply(ctx.t(isImage ? 'photo_added' : "video_added", { uploaded: 1 }), {
                    reply_markup: (0, keyboards_1.someFilesAddedKeyboard)(ctx.t, ctx.session)
                });
            }
            else {
                yield ctx.reply(ctx.t('second_file_question'), {
                    reply_markup: (0, keyboards_1.fileKeyboard)(ctx.t, ctx.session, files.length > 0)
                });
            }
        }
    }
});
exports.fileQuestion = fileQuestion;
