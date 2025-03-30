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
exports.sendMutualSympathyAfterAnswer = void 0;
const keyboards_1 = require("../constants/keyboards");
const postgres_1 = require("../db/postgres");
const sendForm_1 = require("./sendForm");
const defaultOptions = {
    withoutSleepMenu: false
};
const sendMutualSympathyAfterAnswer = (ctx_1, ...args_1) => __awaiter(void 0, [ctx_1, ...args_1], void 0, function* (ctx, options = defaultOptions) {
    var _a;
    // Получаем данные пользователя, который поставил лайк
    const likedUser = yield postgres_1.prisma.user.findUnique({
        where: {
            id: String(ctx.session.pendingMutualLikeProfileId)
        }
    });
    if (likedUser) {
        const userLike = yield postgres_1.prisma.profileLike.findFirst({
            where: {
                fromProfileId: String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id),
                toProfileId: likedUser.id,
                liked: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                privateNote: true
            }
        });
        // Отправляем анкету пользователя, который поставил лайк
        yield (0, sendForm_1.sendForm)(ctx, likedUser, { myForm: false, privateNote: userLike === null || userLike === void 0 ? void 0 : userLike.privateNote });
        ctx.session.step = 'continue_see_forms';
        const userInfo = yield ctx.api.getChat(likedUser.id);
        yield ctx.reply(`${ctx.t('mutual_sympathy')} [${likedUser.name}](https://t.me/${userInfo.username})`, {
            reply_markup: (0, keyboards_1.complainToUserKeyboard)(ctx.t, String(likedUser.id)),
            link_preview_options: {
                is_disabled: true
            },
            parse_mode: 'Markdown',
        });
        if (!options.withoutSleepMenu) {
            ctx.session.step = 'sleep_menu';
            yield ctx.reply(ctx.t('sleep_menu'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
        ctx.session.pendingMutualLike = false;
        ctx.session.pendingMutualLikeProfileId = undefined;
    }
});
exports.sendMutualSympathyAfterAnswer = sendMutualSympathyAfterAnswer;
