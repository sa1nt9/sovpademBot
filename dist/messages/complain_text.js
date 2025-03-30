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
exports.complainTextStep = complainTextStep;
const keyboards_1 = require("../constants/keyboards");
const postgres_1 = require("../db/postgres");
const continueSeeLikesForms_1 = require("../functions/continueSeeLikesForms");
const candidatesEnded_1 = require("../functions/candidatesEnded");
const getCandidate_1 = require("../functions/db/getCandidate");
const saveLike_1 = require("../functions/db/saveLike");
const sendForm_1 = require("../functions/sendForm");
function complainTextStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const message = ctx.message.text;
        if (message === ctx.t('back')) {
            ctx.session.step = 'complain';
            ctx.session.additionalFormInfo.reportType = undefined;
            ctx.session.additionalFormInfo.reportedUserId = '';
            yield ctx.reply(ctx.t('complain_text'), {
                reply_markup: (0, keyboards_1.complainKeyboard)()
            });
            return;
        }
        try {
            if (ctx.session.additionalFormInfo.reportType && (ctx.session.currentCandidateProfile || ctx.session.additionalFormInfo.reportedUserId)) {
                // Создаем запись о жалобе в базе данных
                yield postgres_1.prisma.report.create({
                    data: {
                        reporterId: String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id),
                        targetId: ((_b = ctx.session.currentCandidateProfile) === null || _b === void 0 ? void 0 : _b.id) || ctx.session.additionalFormInfo.reportedUserId || "",
                        type: ctx.session.additionalFormInfo.reportType,
                        text: message === ctx.t('send_complain_without_comment') ? 'withour comment' : message
                    }
                });
                if (ctx.session.currentCandidateProfile) {
                    yield (0, saveLike_1.saveLike)(ctx, (_c = ctx.session.currentCandidateProfile) === null || _c === void 0 ? void 0 : _c.id, false);
                }
                // Очищаем данные о жалобе в сессии
                ctx.session.additionalFormInfo.reportType = undefined;
                ctx.session.additionalFormInfo.reportedUserId = '';
                // Информируем пользователя о принятии жалобы
                yield ctx.reply(ctx.t('complain_will_be_examined'));
            }
            if (ctx.session.additionalFormInfo.searchingLikes) {
                ctx.session.step = 'search_people_with_likes';
                yield (0, continueSeeLikesForms_1.continueSeeLikesForms)(ctx);
            }
            else {
                ctx.session.step = 'search_people';
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
            }
        }
        catch (error) {
            ctx.logger.error(error, 'Error saving report');
            // В случае ошибки возвращаемся к просмотру анкет
            ctx.session.step = 'search_people';
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
        }
    });
}
