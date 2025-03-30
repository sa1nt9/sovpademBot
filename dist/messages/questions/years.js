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
exports.yearsQuestion = void 0;
const keyboards_1 = require("../../constants/keyboards");
const keyboards_2 = require("../../constants/keyboards");
const yearsQuestion = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const message = ctx.message.text;
    const n = Number(message);
    if (!/^\d+$/.test(message || "str")) {
        yield ctx.reply(ctx.t('type_years'), {
            reply_markup: (0, keyboards_2.ageKeyboard)(ctx.session)
        });
    }
    else if (n <= 8) {
        yield ctx.reply(ctx.t('type_bigger_year'), {
            reply_markup: (0, keyboards_2.ageKeyboard)(ctx.session)
        });
    }
    else if (n > 100) {
        yield ctx.reply(ctx.t('type_smaller_year'), {
            reply_markup: (0, keyboards_2.ageKeyboard)(ctx.session)
        });
    }
    else {
        ctx.session.activeProfile.age = n;
        ctx.session.question = "gender";
        yield ctx.reply(ctx.t('gender_question'), {
            reply_markup: (0, keyboards_1.genderKeyboard)(ctx.t)
        });
    }
});
exports.yearsQuestion = yearsQuestion;
