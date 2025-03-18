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
exports.sendLikesNotification = sendLikesNotification;
const keyboards_1 = require("../constants/keyboards");
const postgres_1 = require("../db/postgres");
const main_1 = require("../main");
const getLikesInfo_1 = require("./db/getLikesInfo");
const sendForm_1 = require("./sendForm");
function sendLikesNotification(ctx, targetUserId, isAnswer) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { count, gender } = yield (0, getLikesInfo_1.getLikesInfo)(targetUserId);
        if (count > 0) {
            try {
                const currentSession = yield postgres_1.prisma.session.findUnique({
                    where: {
                        key: targetUserId
                    }
                });
                if (currentSession) {
                    const currentValue = currentSession ? JSON.parse(currentSession.value) : {};
                    if (isAnswer) {
                        yield (0, sendForm_1.sendForm)(ctx, null, { myForm: true, sendTo: targetUserId });
                        yield main_1.bot.api.sendMessage(targetUserId, `${ctx.t('mutual_sympathy')} [${ctx.session.form.name}](https://t.me/${(_a = ctx.from) === null || _a === void 0 ? void 0 : _a.username})`, {
                            reply_markup: (0, keyboards_1.continueSeeFormsKeyboard)(ctx.t),
                            parse_mode: 'Markdown',
                        });
                        yield postgres_1.prisma.session.update({
                            where: {
                                key: targetUserId
                            },
                            data: {
                                value: JSON.stringify(Object.assign(Object.assign({}, currentValue), { step: 'sleep_menu' }))
                            }
                        });
                        yield main_1.bot.api.sendMessage(targetUserId, ctx.t('sleep_menu'), {
                            reply_markup: (0, keyboards_1.profileKeyboard)()
                        });
                    }
                    else {
                        yield postgres_1.prisma.session.update({
                            where: {
                                key: targetUserId
                            },
                            data: {
                                value: JSON.stringify(Object.assign(Object.assign({}, currentValue), { step: 'somebodys_liked_you' }))
                            }
                        });
                        yield main_1.bot.api.sendMessage(targetUserId, ctx.t('somebodys_liked_you', {
                            count,
                            gender
                        }), {
                            reply_markup: (0, keyboards_1.somebodysLikedYouKeyboard)()
                        });
                    }
                }
                else {
                    ctx.logger.error('Error updating session somebodys_liked_you, session not found');
                }
            }
            catch (error) {
                ctx.logger.error(error, 'Error updating session somebodys_liked_you');
            }
        }
    });
}
