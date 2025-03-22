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
exports.chooseLanguageStep = chooseLanguageStep;
const languages_1 = require("../constants/languages");
const keyboards_1 = require("../constants/keyboards");
const sendForm_1 = require("../functions/sendForm");
const postgres_1 = require("../db/postgres");
function chooseLanguageStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const message = ctx.message.text;
        const language = languages_1.languages.find(i => i.name === message);
        if (language) {
            yield ctx.i18n.setLocale(language.mark || "ru");
            const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
            const existingUser = yield postgres_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (existingUser) {
                ctx.session.step = "profile";
                yield (0, sendForm_1.sendForm)(ctx);
                yield ctx.reply(ctx.t('profile_menu'), {
                    reply_markup: (0, keyboards_1.profileKeyboard)()
                });
            }
            else {
                if (ctx.session.privacyAccepted) {
                    ctx.session.step = "questions";
                    ctx.session.question = 'years';
                    yield ctx.reply(ctx.t('years_question'), {
                        reply_markup: (0, keyboards_1.ageKeyboard)(ctx.session)
                    });
                }
                else {
                    ctx.session.step = "accept_privacy";
                    yield ctx.reply(ctx.t('privacy_message'), {
                        reply_markup: (0, keyboards_1.acceptPrivacyKeyboard)(ctx.t),
                    });
                }
            }
        }
        else {
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: keyboards_1.languageKeyboard
            });
        }
    });
}
