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
exports.disableFormStep = disableFormStep;
const keyboards_1 = require("./../constants/keyboards");
const keyboards_2 = require("../constants/keyboards");
function disableFormStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = ctx.message.text;
        if (message === '1') {
            //await toggleUserActive(ctx, false)
            ctx.session.step = 'form_disabled';
            yield ctx.reply(ctx.t('form_disabled_message'), {
                reply_markup: (0, keyboards_2.formDisabledKeyboard)(ctx.t)
            });
        }
        else if (message === '2') {
            ctx.session.step = 'sleep_menu';
            yield ctx.reply(ctx.t('sleep_menu'), {
                reply_markup: (0, keyboards_2.profileKeyboard)()
            });
        }
        else {
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.disableFormKeyboard)()
            });
        }
    });
}
