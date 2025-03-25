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
exports.candidatesEnded = void 0;
const keyboards_1 = require("../constants/keyboards");
const candidatesEnded = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply(ctx.t('candidates_ended'));
    ctx.session.step = 'sleep_menu';
    yield ctx.reply(ctx.t('sleep_menu'), {
        reply_markup: (0, keyboards_1.profileKeyboard)()
    });
});
exports.candidatesEnded = candidatesEnded;
