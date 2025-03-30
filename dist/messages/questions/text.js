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
const saveForm_1 = require("../../functions/db/saveForm");
const sendForm_1 = require("../../functions/sendForm");
const postgres_1 = require("../../db/postgres");
const textQuestion = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const message = ctx.message.text;
    if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
        ctx.session.question = "years";
        ctx.session.step = 'profile';
        ctx.session.additionalFormInfo.canGoBack = false;
        yield (0, sendForm_1.sendForm)(ctx);
        yield ctx.reply(ctx.t('profile_menu'), {
            reply_markup: (0, keyboards_1.profileKeyboard)()
        });
    }
    else if (message && message.length > 1000) {
        yield ctx.reply(ctx.t('long_text'), {
            reply_markup: (0, keyboards_1.textKeyboard)(ctx.t, ctx.session)
        });
    }
    else if ((0, hasLinks_1.hasLinks)(message || "")) {
        yield ctx.reply(ctx.t('this_text_breaks_the_rules'), {
            reply_markup: (0, keyboards_1.textKeyboard)(ctx.t, ctx.session)
        });
    }
    else {
        ctx.session.activeProfile.description = (!message || message === ctx.t('skip')) ? "" : message;
        if (ctx.session.additionalFormInfo.canGoBack) {
            ctx.session.question = "years";
            ctx.session.step = 'profile';
            ctx.session.additionalFormInfo.canGoBack = false;
            yield (0, saveForm_1.saveForm)(ctx);
            yield (0, sendForm_1.sendForm)(ctx);
            yield ctx.reply(ctx.t('profile_menu'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
        else {
            ctx.session.question = "file";
            const user = yield postgres_1.prisma.user.findUnique({
                where: { id: String(ctx.message.from.id) },
                // select: { files: true },
            });
            // const files = user?.files ? JSON.parse(user?.files as any) : []
            // 
            // await ctx.reply(ctx.t('file_question'), {
            //     reply_markup: fileKeyboard(ctx.t, ctx.session, files.length > 0)
            // });
        }
    }
});
exports.textQuestion = textQuestion;
