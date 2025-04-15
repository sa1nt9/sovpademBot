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
exports.itExperienceQuestion = void 0;
const keyboards_1 = require("../../constants/keyboards");
const checkIsKeyboardOption_1 = require("../../functions/checkIsKeyboardOption");
const itExperienceQuestion = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const message = ctx.message.text;
    const userId = String(ctx.from.id);
    ctx.logger.info({
        userId,
        question: 'it_experience',
        input: message,
        profileType: (_a = ctx.session.activeProfile) === null || _a === void 0 ? void 0 : _a.profileType
    }, 'User answering IT experience question');
    if (message && (0, checkIsKeyboardOption_1.checkIsKeyboardOption)((0, keyboards_1.selectItExperienceKeyboard)(ctx.t), message)) {
        ctx.logger.info({ userId, itExperience: message }, 'User IT experience validated and saved');
        ctx.session.question = 'it_technologies';
        ctx.session.activeProfile.experience = message;
        yield ctx.reply(ctx.t('it_technologies_question'), {
            reply_markup: (0, keyboards_1.itTechnologiesKeyboard)(ctx.t, ctx.session)
        });
    }
    else {
        ctx.logger.warn({ userId, invalidOption: message }, 'User provided invalid IT experience option');
        yield ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: (0, keyboards_1.selectSportLevelkeyboard)(ctx.t)
        });
    }
});
exports.itExperienceQuestion = itExperienceQuestion;
