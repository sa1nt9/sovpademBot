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
exports.rouletteStartStep = void 0;
exports.showRouletteStart = showRouletteStart;
const keyboards_1 = require("../constants/keyboards");
const postgres_1 = require("../db/postgres");
const findRouletteUser_1 = require("../functions/findRouletteUser");
const getUserReactions_1 = require("../functions/getUserReactions");
const sendForm_1 = require("../functions/sendForm");
const rouletteStartStep = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const message = ctx.message.text;
    const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
    if (message === ctx.t('main_menu')) {
        ctx.session.step = 'profile';
        yield (0, sendForm_1.sendForm)(ctx);
        yield ctx.reply(ctx.t('profile_menu'), {
            reply_markup: (0, keyboards_1.profileKeyboard)()
        });
    }
    else if (message === ctx.t('roulette_find')) {
        ctx.session.step = 'roulette_searching';
        // Проверяем наличие активной анкеты
        const existingUser = yield postgres_1.prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (existingUser) {
            yield (0, findRouletteUser_1.findRouletteUser)(ctx);
        }
        else {
            ctx.session.step = "you_dont_have_form";
            yield ctx.reply(ctx.t('you_dont_have_form'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
    }
    else {
        yield ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: (0, keyboards_1.rouletteStartKeyboard)(ctx.t)
        });
    }
});
exports.rouletteStartStep = rouletteStartStep;
// Вызывается для отображения стартового экрана рулетки с реакциями
function showRouletteStart(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const userId = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
        const reactionsMessage = yield (0, getUserReactions_1.getUserReactions)(ctx, userId, true);
        let fullMessage;
        if (reactionsMessage) {
            fullMessage = ctx.t('roulette_start', { reactions: `\n${reactionsMessage}\n` });
        }
        else {
            fullMessage = ctx.t('roulette_start', { reactions: '' });
        }
        yield ctx.reply(fullMessage, {
            reply_markup: (0, keyboards_1.rouletteStartKeyboard)(ctx.t)
        });
    });
}
