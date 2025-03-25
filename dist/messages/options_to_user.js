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
exports.optionsToUserStep = optionsToUserStep;
const getCandidate_1 = require("../functions/db/getCandidate");
const candidatesEnded_1 = require("../functions/candidatesEnded");
const sendForm_1 = require("../functions/sendForm");
const keyboards_1 = require("../constants/keyboards");
const sendMutualSympathyAfterAnswer_1 = require("../functions/sendMutualSympathyAfterAnswer");
const postgres_1 = require("../db/postgres");
function optionsToUserStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const message = ctx.message.text;
        if (message === '1. 🚫') {
            if (ctx.session.currentCandidate) {
                // Проверяем, не добавлен ли уже пользователь в черный список
                const existingBlacklist = yield postgres_1.prisma.blacklist.findFirst({
                    where: {
                        userId: String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id),
                        targetId: ctx.session.currentCandidate.id
                    }
                });
                if (existingBlacklist) {
                    yield ctx.reply(ctx.t('more_options_blacklist_already'));
                    return;
                }
                // Добавляем пользователя в черный список
                yield postgres_1.prisma.blacklist.create({
                    data: {
                        userId: String((_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id),
                        targetId: ctx.session.currentCandidate.id
                    }
                });
                yield ctx.reply(ctx.t('more_options_blacklist_success'));
                ctx.session.step = 'search_people';
                if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeUserId) {
                    yield (0, sendMutualSympathyAfterAnswer_1.sendMutualSympathyAfterAnswer)(ctx);
                    return;
                }
                yield ctx.reply("✨🔍", {
                    reply_markup: (0, keyboards_1.answerFormKeyboard)()
                });
                const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
                ctx.logger.info(candidate, 'This is new candidate');
                if (candidate) {
                    yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
                }
                else {
                    yield (0, candidatesEnded_1.candidatesEnded)(ctx);
                }
            }
        }
        else if (message === '2. ⚠️') {
            ctx.session.step = "complain";
            yield ctx.reply(ctx.t('complain_text'), {
                reply_markup: (0, keyboards_1.complainKeyboard)()
            });
        }
        else if (message === '3. 💤') {
            ctx.session.step = 'sleep_menu';
            yield ctx.reply(ctx.t('wait_somebody_to_see_your_form'));
            if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeUserId) {
                yield (0, sendMutualSympathyAfterAnswer_1.sendMutualSympathyAfterAnswer)(ctx);
                return;
            }
            yield ctx.reply(ctx.t('sleep_menu'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
        else if (message === ctx.t("go_back")) {
            ctx.session.step = 'search_people';
            yield ctx.reply("✨🔍", {
                reply_markup: (0, keyboards_1.answerFormKeyboard)()
            });
            const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
            ctx.logger.info(candidate, 'This is new candidate');
            if (candidate) {
                yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
            }
            else {
                yield (0, candidatesEnded_1.candidatesEnded)(ctx);
            }
        }
        else {
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.optionsToUserKeyboard)(ctx.t)
            });
        }
    });
}
