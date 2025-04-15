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
    var _a;
    const message = ctx.message.text;
    const userId = String(ctx.from.id);
    ctx.logger.info({
        userId,
        question: 'years',
        input: message,
        profileType: (_a = ctx.session.activeProfile) === null || _a === void 0 ? void 0 : _a.profileType
    }, 'User answering age question');
    const n = Number(message);
    if (!/^\d+$/.test(message || "str")) {
        ctx.logger.warn({ userId, invalidInput: message }, 'User provided non-numeric age');
        yield ctx.reply(ctx.t('type_years'), {
            reply_markup: (0, keyboards_2.ageKeyboard)(ctx.session)
        });
    }
    else if (n <= 8) {
        ctx.logger.warn({ userId, age: n }, 'User provided age too low');
        yield ctx.reply(ctx.t('type_bigger_year'), {
            reply_markup: (0, keyboards_2.ageKeyboard)(ctx.session)
        });
    }
    else if (n > 100) {
        ctx.logger.warn({ userId, age: n }, 'User provided age too high');
        yield ctx.reply(ctx.t('type_smaller_year'), {
            reply_markup: (0, keyboards_2.ageKeyboard)(ctx.session)
        });
    }
    else {
        ctx.logger.info({ userId, age: n }, 'User age validated and saved');
        ctx.session.activeProfile.age = n;
        ctx.session.question = "gender";
        yield ctx.reply(ctx.t('gender_question'), {
            reply_markup: (0, keyboards_1.genderKeyboard)(ctx.t)
        });
    }
});
exports.yearsQuestion = yearsQuestion;
