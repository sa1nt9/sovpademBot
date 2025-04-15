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
const i18n_1 = require("../i18n");
const getLikesInfo_1 = require("./db/getLikesInfo");
const sendForm_1 = require("./sendForm");
const utils_1 = require("../queues/utils");
const client_1 = require("@prisma/client");
function sendLikesNotification(ctx, targetUserId, isAnswer) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const fromUserId = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
        ctx.logger.info({
            fromUserId,
            targetUserId,
            isAnswer
        }, 'Starting likes notification');
        const { count, gender } = yield (0, getLikesInfo_1.getLikesInfo)(targetUserId, 'user');
        try {
            const currentSession = yield postgres_1.prisma.session.findUnique({
                where: {
                    key: targetUserId
                }
            });
            if (currentSession) {
                const currentValue = JSON.parse(currentSession.value);
                // Получаем пользователя, чтобы узнать его пол
                const targetUser = yield postgres_1.prisma.user.findUnique({
                    where: {
                        id: targetUserId
                    },
                    select: {
                        gender: true
                    }
                });
                if (isAnswer) {
                    ctx.logger.info({
                        fromUserId,
                        targetUserId,
                        step: currentValue.step,
                        hasCurrentCandidate: !!((_b = currentValue.currentCandidateProfile) === null || _b === void 0 ? void 0 : _b.id)
                    }, 'Processing mutual like notification');
                    if ((currentValue.step === 'search_people' || currentValue.step === 'search_people_with_likes') && ((_c = currentValue.currentCandidateProfile) === null || _c === void 0 ? void 0 : _c.id)) {
                        yield ctx.api.sendMessage(targetUserId, (0, i18n_1.i18n)(false).t(currentValue.__language_code || "ru", 'somebody_liked_you_end_with_it'));
                        yield postgres_1.prisma.session.update({
                            where: {
                                key: targetUserId
                            },
                            data: {
                                value: JSON.stringify(Object.assign(Object.assign({}, currentValue), { pendingMutualLike: true, pendingMutualLikeProfileId: fromUserId }))
                            }
                        });
                        ctx.logger.info({
                            fromUserId,
                            targetUserId,
                            step: currentValue.step
                        }, 'Updated session with pending mutual like');
                    }
                    else {
                        const rouletteUser = yield postgres_1.prisma.rouletteUser.findUnique({
                            where: { id: targetUserId },
                            select: {
                                searchingPartner: true,
                                chatPartnerId: true
                            }
                        });
                        if ((rouletteUser === null || rouletteUser === void 0 ? void 0 : rouletteUser.searchingPartner) || (rouletteUser === null || rouletteUser === void 0 ? void 0 : rouletteUser.chatPartnerId)) {
                            yield (0, utils_1.scheduleNotification)(targetUserId, fromUserId, client_1.NotificationType.MUTUAL_LIKE, {
                                isAnswer: true,
                                delay: 2 * 60 * 1000
                            });
                            ctx.logger.info({
                                fromUserId,
                                targetUserId,
                                isAnswer,
                                notificationType: client_1.NotificationType.MUTUAL_LIKE
                            }, 'Notification scheduled successfully');
                            return;
                        }
                        const userLike = yield postgres_1.prisma.profileLike.findFirst({
                            where: {
                                toProfileId: targetUserId,
                                fromProfileId: fromUserId,
                                liked: true
                            },
                            orderBy: {
                                createdAt: 'desc'
                            },
                            select: {
                                privateNote: true
                            }
                        });
                        yield (0, sendForm_1.sendForm)(ctx, null, {
                            myForm: true,
                            sendTo: targetUserId,
                            privateNote: userLike === null || userLike === void 0 ? void 0 : userLike.privateNote
                        });
                        yield ctx.api.sendMessage(targetUserId, `${(0, i18n_1.i18n)(false).t(currentValue.__language_code || "ru", 'mutual_sympathy')} [${ctx.session.activeProfile.name}](https://t.me/${((_d = ctx.from) === null || _d === void 0 ? void 0 : _d.username) || ''})`, {
                            reply_markup: (0, keyboards_1.complainToUserKeyboard)((...args) => (0, i18n_1.i18n)(false).t(currentValue.__language_code || "ru", ...args), fromUserId),
                            link_preview_options: {
                                is_disabled: true
                            },
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
                        yield ctx.api.sendMessage(targetUserId, (0, i18n_1.i18n)(false).t(currentValue.__language_code || "ru", 'sleep_menu'), {
                            reply_markup: (0, keyboards_1.profileKeyboard)()
                        });
                        ctx.logger.info({
                            fromUserId,
                            targetUserId
                        }, 'Sent mutual sympathy notification and updated session');
                    }
                }
                else {
                    yield (0, utils_1.scheduleNotification)(targetUserId, fromUserId, client_1.NotificationType.LIKE, {
                        isAnswer: false
                    });
                    ctx.logger.info({
                        fromUserId,
                        targetUserId,
                        isAnswer,
                        notificationType: client_1.NotificationType.LIKE
                    }, 'Notification scheduled successfully');
                }
            }
            else {
                ctx.logger.error({
                    fromUserId,
                    targetUserId
                }, 'Error updating session somebodys_liked_you, session not found');
            }
        }
        catch (error) {
            ctx.logger.error({
                fromUserId,
                targetUserId,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            }, 'Error updating session somebodys_liked_you');
        }
    });
}
