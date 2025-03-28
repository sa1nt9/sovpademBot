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
exports.mutualSympathiesStep = mutualSympathiesStep;
const keyboards_1 = require("../constants/keyboards");
const postgres_1 = require("../db/postgres");
const sendForm_1 = require("../functions/sendForm");
function mutualSympathiesStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const message = ctx.message.text;
        if (message === '💝 Взаимные симпатии') {
            const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
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
                }
            });
            if (mutualLikes.length === 0) {
                yield ctx.reply(ctx.t('no_mutual_sympathies'));
                return;
            }
            // Отправляем первую анкету из списка
            const firstLike = mutualLikes[0];
            ctx.session.currentMutualLike = firstLike;
            ctx.session.mutualLikes = mutualLikes;
            ctx.session.currentMutualLikeIndex = 0;
            yield (0, sendForm_1.sendForm)(ctx, firstLike.target, {
                myForm: false,
                isMutualSympathy: true,
                mutualLikeCount: mutualLikes.length
            });
            yield ctx.reply(ctx.t('mutual_sympathies_navigation'), {
                reply_markup: {
                    keyboard: [
                        ['⬅️', '➡️'],
                        [ctx.t('back_to_profile')]
                    ],
                    resize_keyboard: true
                }
            });
        }
        else if (message === '⬅️' || message === '➡️') {
            if (!ctx.session.mutualLikes || !ctx.session.currentMutualLikeIndex) {
                yield ctx.reply(ctx.t('error_occurred'));
                return;
            }
            const direction = message === '➡️' ? 1 : -1;
            const newIndex = (ctx.session.currentMutualLikeIndex + direction + ctx.session.mutualLikes.length) % ctx.session.mutualLikes.length;
            ctx.session.currentMutualLikeIndex = newIndex;
            ctx.session.currentMutualLike = ctx.session.mutualLikes[newIndex];
            yield (0, sendForm_1.sendForm)(ctx, ctx.session.currentMutualLike.target, {
                myForm: false,
                isMutualSympathy: true,
                mutualLikeCount: ctx.session.mutualLikes.length
            });
        }
        else if (message === ctx.t('back_to_profile')) {
            ctx.session.step = 'profile';
            ctx.session.currentMutualLike = null;
            ctx.session.mutualLikes = null;
            ctx.session.currentMutualLikeIndex = null;
            yield ctx.reply(ctx.t('profile_menu'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
        else {
            yield ctx.reply(ctx.t('no_such_answer'));
        }
    });
}
