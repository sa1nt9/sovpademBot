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
exports.matchCallbackQuery = void 0;
const postgres_1 = require("../db/postgres");
const sendForm_1 = require("../functions/sendForm");
const keyboards_1 = require("../constants/keyboards");
const matchCallbackQuery = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const callbackQuery = ctx.callbackQuery;
    const callbackData = callbackQuery.data || "";
    const targetUserId = callbackData.split(":")[1];
    const targetUser = yield postgres_1.prisma.user.findUnique({
        where: {
            id: targetUserId,
            isActive: true
        }
    });
    if (!targetUser) {
        yield ctx.answerCallbackQuery({
            text: ctx.t('user_not_found'),
            show_alert: true
        });
        return;
    }
    const userInfo = yield ctx.api.getChat(targetUser.id);
    const username = `https://t.me/${userInfo.username}`;
    const text = ctx.t('match_selected', { user: `[${targetUser.name}](${username})` });
    ctx.session.step = 'go_main_menu';
    yield ctx.answerCallbackQuery({
        text: ctx.t('match_you_select', { user: targetUser.name }),
        show_alert: false,
    });
    yield ctx.reply(text, {
        parse_mode: 'Markdown',
        reply_markup: (0, keyboards_1.mainMenuKeyboard)(ctx.t),
        link_preview_options: {
            is_disabled: true
        }
    });
    yield (0, sendForm_1.sendForm)(ctx, targetUser, { myForm: false });
});
exports.matchCallbackQuery = matchCallbackQuery;
