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
exports.nameQuestion = void 0;
const keyboards_1 = require("../../constants/keyboards");
const nameQuestion = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const message = ctx.message.text;
    const userId = String(ctx.from.id);
    ctx.logger.info({
        userId,
        question: 'name',
        input: message,
        profileType: (_a = ctx.session.activeProfile) === null || _a === void 0 ? void 0 : _a.profileType
    }, 'User answering name question');
    if (!message) {
        ctx.logger.warn({ userId }, 'User sent empty name');
        yield ctx.reply(ctx.t('type_name'), {
            reply_markup: (0, keyboards_1.nameKeyboard)(ctx.session)
        });
    }
    else if (message.length > 100) {
        ctx.logger.warn({ userId, nameLength: message.length }, 'User name too long');
        yield ctx.reply(ctx.t('long_name'), {
            reply_markup: (0, keyboards_1.nameKeyboard)(ctx.session)
        });
    }
    else {
        ctx.logger.info({ userId, name: message }, 'User name validated and saved');
        ctx.session.question = "text";
        if (ctx.session.activeProfile.name) {
            ctx.session.activeProfile.previousName = ctx.session.activeProfile.name;
        }
        ctx.session.activeProfile.name = message;
        yield ctx.reply(ctx.t('text_question', {
            profileType: ctx.session.additionalFormInfo.selectedProfileType
        }), {
            reply_markup: (0, keyboards_1.textKeyboard)(ctx.t, ctx.session)
        });
    }
});
exports.nameQuestion = nameQuestion;
