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
exports.genderQuestion = void 0;
const keyboards_1 = require("../../constants/keyboards");
const genderQuestion = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const message = ctx.message.text;
    if ((_a = (0, keyboards_1.genderKeyboard)(ctx.t)) === null || _a === void 0 ? void 0 : _a.keyboard[0].includes(message || "")) {
        ctx.session.question = "interested_in";
        ctx.session.activeProfile.gender = message === ctx.t('i_man') ? 'male' : 'female';
        yield ctx.reply(ctx.t('interested_in_question'), {
            reply_markup: (0, keyboards_1.interestedInKeyboard)(ctx.t)
        });
    }
    else {
        yield ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: (0, keyboards_1.genderKeyboard)(ctx.t)
        });
    }
});
exports.genderQuestion = genderQuestion;
