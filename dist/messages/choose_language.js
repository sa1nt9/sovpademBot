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
function chooseLanguageStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = ctx.message.text;
        const language = languages_1.languages.find(i => i.name === message);
        if (language) {
            yield ctx.i18n.setLocale(language.mark || "ru");
            ctx.session.step = "prepare_message";
            yield ctx.reply(ctx.t('lets_start'), {
                reply_markup: (0, keyboards_1.prepareMessageKeyboard)(ctx.t),
            });
        }
        else {
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: keyboards_1.languageKeyboard
            });
        }
    });
}
