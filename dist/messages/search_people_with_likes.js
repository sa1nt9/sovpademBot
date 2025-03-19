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
exports.searchPeopleWithLikesStep = searchPeopleWithLikesStep;
const keyboards_1 = require("../constants/keyboards");
const getOneLike_1 = require("../functions/db/getOneLike");
const saveLike_1 = require("../functions/db/saveLike");
const setMutualLike_1 = require("../functions/db/setMutualLike");
const sendForm_1 = require("../functions/sendForm");
const sendLikesNotification_1 = require("../functions/sendLikesNotification");
const main_1 = require("../main");
function searchPeopleWithLikesStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = ctx.message.text;
        if (message === '❤️') {
            if (ctx.session.currentCandidate) {
                ctx.logger.info(ctx.session.currentCandidate, 'Candidate to set mutual like');
                yield (0, setMutualLike_1.setMutualLike)(ctx.session.currentCandidate.id, String(ctx.from.id));
                yield (0, saveLike_1.saveLike)(ctx, ctx.session.currentCandidate.id, true, { isMutual: true });
                const userInfo = yield main_1.bot.api.getChat(ctx.session.currentCandidate.id);
                yield (0, sendLikesNotification_1.sendLikesNotification)(ctx, ctx.session.currentCandidate.id, true);
                ctx.session.step = 'continue_see_likes_forms';
                yield ctx.reply(`${ctx.t('good_mutual_sympathy')} [${ctx.session.currentCandidate.name}](https://t.me/${userInfo.username})`, {
                    parse_mode: 'Markdown',
                    reply_markup: (0, keyboards_1.continueSeeFormsKeyboard)(ctx.t)
                });
            }
        }
        else if (message === '👎') {
            if (ctx.session.currentCandidate) {
                yield (0, saveLike_1.saveLike)(ctx, ctx.session.currentCandidate.id, false);
                const oneLike = yield (0, getOneLike_1.getOneLike)(String(ctx.from.id));
                if (oneLike === null || oneLike === void 0 ? void 0 : oneLike.user) {
                    yield (0, sendForm_1.sendForm)(ctx, oneLike.user, { myForm: false, like: oneLike });
                }
                else {
                    ctx.session.step = 'continue_see_forms';
                    ctx.session.additionalFormInfo.searchingLikes = false;
                    yield ctx.reply(ctx.t('its_all_go_next_question'), {
                        reply_markup: (0, keyboards_1.continueSeeFormsKeyboard)(ctx.t)
                    });
                }
            }
        }
        else if (message === '⚠️') {
            ctx.session.step = "complain";
            yield ctx.reply(ctx.t('complain_text'), {
                reply_markup: (0, keyboards_1.complainKeyboard)()
            });
        }
        else if (message === '💤') {
            ctx.session.step = 'sleep_menu';
            yield ctx.reply(ctx.t('wait_somebody_to_see_your_form'));
            yield ctx.reply(ctx.t('sleep_menu'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
        else {
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.answerLikesFormKeyboard)()
            });
        }
    });
}
