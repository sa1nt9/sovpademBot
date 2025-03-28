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
exports.matchesCommand = void 0;
const keyboards_1 = require("../constants/keyboards");
const postgres_1 = require("../db/postgres");
const grammy_1 = require("grammy");
const formatDate_1 = require("../functions/formatDate");
const matchesCommand = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
    const existingUser = yield postgres_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (existingUser) {
        ctx.session.step = 'sleep_menu';
        // Получаем все взаимные симпатии пользователя
        const mutualLikes = yield postgres_1.prisma.userLike.findMany({
            where: {
                userId: userId,
                liked: true,
                isMutual: true
            },
            include: {
                target: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 101
        });
        if (mutualLikes.length === 0) {
            ctx.session.step = 'form_disabled';
            yield ctx.reply(ctx.t('no_matches'), {
                reply_markup: (0, keyboards_1.formDisabledKeyboard)(ctx.t)
            });
            return;
        }
        let message = mutualLikes.length > 100 ? ctx.t('matches_message_last') : ctx.t('matches_message_all') + '\n\n';
        // Создаем inline клавиатуру с номерами
        const keyboard = new grammy_1.InlineKeyboard();
        const buttonsPerRow = 5;
        for (let i = 0; i < mutualLikes.length; i++) {
            const like = mutualLikes[i];
            const userInfo = yield ctx.api.getChat(like.target.id);
            const username = `https://t.me/${userInfo.username}`;
            message += `${i + 1}. [${like.target.name}](${username}) - ${(0, formatDate_1.formatDate)(like.isMutualAt || like.createdAt)}\n`;
            if (i % buttonsPerRow === 0 && i !== 0) {
                keyboard.row();
            }
            keyboard.text(`${i + 1}. ${like.target.name}`, `match:${like.target.id}`);
        }
        message += `\n${ctx.t('matches_message_choose')}`;
        yield ctx.reply(message, {
            parse_mode: 'Markdown',
            link_preview_options: {
                is_disabled: true
            },
            reply_markup: keyboard
        });
        yield ctx.reply(ctx.t('sleep_menu'), {
            reply_markup: (0, keyboards_1.profileKeyboard)()
        });
    }
    else {
        ctx.session.step = "you_dont_have_form";
        yield ctx.reply(ctx.t('you_dont_have_form'), {
            reply_markup: (0, keyboards_1.notHaveFormToDeactiveKeyboard)(ctx.t)
        });
    }
});
exports.matchesCommand = matchesCommand;
