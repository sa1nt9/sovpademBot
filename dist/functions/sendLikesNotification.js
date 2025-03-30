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
const getLikesInfo_1 = require("./db/getLikesInfo");
const sendForm_1 = require("./sendForm");
function sendLikesNotification(ctx, targetUserId, isAnswer) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        const { count, gender } = yield (0, getLikesInfo_1.getLikesInfo)(targetUserId, ctx.session.activeProfile.profileType);
        try {
            const currentSession = yield postgres_1.prisma.session.findUnique({
                where: {
                    key: targetUserId
                }
            });
            if (currentSession) {
                const currentValue = currentSession ? JSON.parse(currentSession.value) : {};
                // Получаем пользователя, чтобы узнать его пол
                const targetUser = yield postgres_1.prisma.user.findUnique({
                    where: {
                        id: targetUserId
                    },
                    select: {
                        gender: true
                    }
                });
                // Пол пользователя для правильного склонения
                const userGender = (targetUser === null || targetUser === void 0 ? void 0 : targetUser.gender) === 'female' ? 'female' : 'male';
                if (isAnswer) {
                    ctx.logger.info({ currentValue, targetUserId, isAnswer });
                    if ((currentValue.step === 'search_people' || currentValue.step === 'search_people_with_likes') && ((_a = currentValue.currentCandidateProfile) === null || _a === void 0 ? void 0 : _a.id)) {
                        yield ctx.api.sendMessage(targetUserId, ctx.t('somebody_liked_you_end_with_it'));
                        yield postgres_1.prisma.session.update({
                            where: {
                                key: targetUserId
                            },
                            data: {
                                value: JSON.stringify(Object.assign(Object.assign({}, currentValue), { pendingMutualLike: true, pendingMutualLikeProfileId: String((_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id) }))
                            }
                        });
                    }
                    else {
                        const userLike = yield postgres_1.prisma.profileLike.findFirst({
                            where: {
                                toProfileId: targetUserId,
                                fromProfileId: String((_c = ctx.from) === null || _c === void 0 ? void 0 : _c.id),
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
                        yield ctx.api.sendMessage(targetUserId, `${ctx.t('mutual_sympathy')} [${ctx.session.activeProfile.name}](https://t.me/${(_d = ctx.from) === null || _d === void 0 ? void 0 : _d.username})`, {
                            reply_markup: (0, keyboards_1.complainToUserKeyboard)(ctx.t, String((_e = ctx.from) === null || _e === void 0 ? void 0 : _e.id)),
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
                        yield ctx.api.sendMessage(targetUserId, ctx.t('sleep_menu'), {
                            reply_markup: (0, keyboards_1.profileKeyboard)()
                        });
                    }
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
                    yield ctx.api.sendMessage(targetUserId, ctx.t('somebodys_liked_you', {
                        count,
                        gender,
                        userGender
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
    });
}
