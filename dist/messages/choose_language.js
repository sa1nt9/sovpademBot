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
        const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
        ctx.logger.info({ userId, step: 'choose_language', selectedLanguage: message }, 'User selecting language');
        if (language) {
            ctx.logger.info({ userId, languageCode: language.mark }, 'Language selected successfully');
            yield ctx.i18n.setLocale(language.mark || "ru");
            const existingUser = yield postgres_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (existingUser) {
                ctx.logger.info({ userId, existingUser: true }, 'Existing user found, navigating to profile');
                ctx.session.step = "profile";
                yield (0, sendForm_1.sendForm)(ctx);
                yield ctx.reply(ctx.t('profile_menu'), {
                    reply_markup: (0, keyboards_1.profileKeyboard)()
                });
            }
            else {
                ctx.logger.info({ userId, newUser: true }, 'New user detected');
                if (ctx.session.privacyAccepted) {
                    ctx.logger.info({ userId }, 'Privacy accepted, proceeding to profile creation');
                    ctx.session.step = "create_profile_type";
                    ctx.session.isCreatingProfile = true;
                    yield ctx.reply(ctx.t('profile_type_title'), {
                        reply_markup: (0, keyboards_1.createProfileTypeKeyboard)(ctx.t)
                    });
                }
                else {
                    ctx.logger.info({ userId }, 'Redirecting to privacy acceptance');
                    ctx.session.step = "accept_privacy";
                    yield ctx.reply(ctx.t('privacy_message'), {
                        reply_markup: (0, keyboards_1.acceptPrivacyKeyboard)(ctx.t),
                    });
                }
            }
        }
        else {
            ctx.logger.warn({ userId, invalidLanguage: message }, 'User selected invalid language option');
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: keyboards_1.languageKeyboard
            });
        }
    });
}
