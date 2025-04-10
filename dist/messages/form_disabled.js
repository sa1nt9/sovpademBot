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
exports.formDisabledStep = formDisabledStep;
const keyboards_1 = require("../constants/keyboards");
const sendForm_1 = require("../functions/sendForm");
function formDisabledStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = ctx.message.text;
        if (message === ctx.t("create_new_profile")) {
            ctx.session.step = "create_profile_type";
            yield ctx.reply(ctx.t('profile_type_title'), {
                reply_markup: (0, keyboards_1.createProfileTypeKeyboard)(ctx.t)
            });
        }
        else if (message === ctx.t("main_menu")) {
            ctx.session.step = "profile";
            yield (0, sendForm_1.sendForm)(ctx);
            yield ctx.reply(ctx.t('profile_menu'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
        else {
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.formDisabledKeyboard)(ctx.t)
            });
        }
    });
}
