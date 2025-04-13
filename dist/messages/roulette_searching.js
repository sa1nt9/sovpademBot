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
exports.rouletteSearchingStep = rouletteSearchingStep;
const keyboards_1 = require("../constants/keyboards");
const postgres_1 = require("../db/postgres");
const sendForm_1 = require("../functions/sendForm");
const findRouletteUser_1 = require("../functions/findRouletteUser");
const getReactionCounts_1 = require("../functions/getReactionCounts");
const i18n_1 = require("../i18n");
function rouletteSearchingStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
        const message = ctx.message.text;
        const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
        ctx.logger.info({ userId, action: message }, 'Roulette action');
        // Проверяем наличие активной анкеты
        const existingUser = yield postgres_1.prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                rouletteUser: true
            }
        });
        if (existingUser) {
            // Обработка команд рулетки
            if (message === ctx.t('roulette_next') || message === ctx.t('roulette_find') || message === ctx.t('main_menu')) {
                // Если был предыдущий собеседник, разрываем связь
                if ((_b = existingUser.rouletteUser) === null || _b === void 0 ? void 0 : _b.chatPartnerId) {
                    const prevPartnerId = existingUser.rouletteUser.chatPartnerId;
                    ctx.logger.info({ userId, prevPartnerId }, 'Disconnecting from previous partner');
                    // Обновляем статус чата
                    yield postgres_1.prisma.rouletteChat.updateMany({
                        where: {
                            OR: [
                                { user1Id: userId, user2Id: prevPartnerId, endedAt: null },
                                { user1Id: prevPartnerId, user2Id: userId, endedAt: null }
                            ]
                        },
                        data: {
                            endedAt: new Date(),
                            isProfileRevealed: existingUser.rouletteUser.profileRevealed,
                            isUsernameRevealed: existingUser.rouletteUser.usernameRevealed
                        }
                    });
                    yield postgres_1.prisma.rouletteUser.update({
                        where: { id: prevPartnerId },
                        data: {
                            chatPartnerId: null,
                            searchingPartner: false,
                            usernameRevealed: false,
                            profileRevealed: false
                        }
                    });
                    const currentSession = yield postgres_1.prisma.session.findUnique({
                        where: {
                            key: prevPartnerId
                        }
                    });
                    const { __language_code } = currentSession ? JSON.parse(currentSession.value) : {};
                    const translate = (key, ...args) => (0, i18n_1.i18n)(false).t(__language_code || "ru", key, ...args);
                    // Уведомляем предыдущего собеседника
                    yield ctx.api.sendMessage(prevPartnerId, translate('roulette_partner_left'), {
                        reply_markup: (0, keyboards_1.rouletteStartKeyboard)(translate)
                    });
                    const userReactionCounts = yield (0, getReactionCounts_1.getReactionCounts)(userId);
                    yield ctx.api.sendMessage(prevPartnerId, translate('roulette_put_reaction_on_your_partner'), {
                        reply_markup: (0, keyboards_1.rouletteReactionKeyboard)(translate, userId, userReactionCounts)
                    });
                    yield ctx.reply(ctx.t('roulette_chat_ended'), {
                        reply_markup: (0, keyboards_1.rouletteStartKeyboard)(ctx.t)
                    });
                    // Получаем количество реакций для предыдущего собеседника
                    const partnerReactionCounts = yield (0, getReactionCounts_1.getReactionCounts)(prevPartnerId);
                    // Предлагаем пользователю оценить собеседника
                    yield ctx.reply(ctx.t('roulette_put_reaction_on_your_partner'), {
                        reply_markup: (0, keyboards_1.rouletteReactionKeyboard)(ctx.t, prevPartnerId, partnerReactionCounts)
                    });
                }
                if (message === ctx.t('main_menu')) {
                    ctx.logger.info({ userId }, 'Exiting roulette to main menu');
                    ctx.session.step = 'profile';
                    yield (0, sendForm_1.sendForm)(ctx);
                    yield ctx.reply(ctx.t('profile_menu'), {
                        reply_markup: (0, keyboards_1.profileKeyboard)()
                    });
                }
                else {
                    ctx.logger.info({ userId }, 'Finding new roulette partner');
                    yield (0, findRouletteUser_1.findRouletteUser)(ctx);
                }
            }
            else if (message === ctx.t('roulette_stop')) {
                // Завершаем чат
                const partnerUserId = (_c = existingUser.rouletteUser) === null || _c === void 0 ? void 0 : _c.chatPartnerId;
                if (partnerUserId) {
                    ctx.logger.info({ userId, partnerId: partnerUserId }, 'User stopped roulette chat');
                    // Обновляем статус чата
                    yield postgres_1.prisma.rouletteChat.updateMany({
                        where: {
                            OR: [
                                { user1Id: userId, user2Id: partnerUserId, endedAt: null },
                                { user1Id: partnerUserId, user2Id: userId, endedAt: null }
                            ]
                        },
                        data: {
                            endedAt: new Date(),
                            isProfileRevealed: (_d = existingUser.rouletteUser) === null || _d === void 0 ? void 0 : _d.profileRevealed,
                            isUsernameRevealed: (_e = existingUser.rouletteUser) === null || _e === void 0 ? void 0 : _e.usernameRevealed
                        }
                    });
                    yield postgres_1.prisma.rouletteUser.update({
                        where: { id: partnerUserId },
                        data: {
                            chatPartnerId: null,
                            searchingPartner: false,
                            usernameRevealed: false,
                            profileRevealed: false
                        }
                    });
                    const currentSession = yield postgres_1.prisma.session.findUnique({
                        where: {
                            key: partnerUserId
                        }
                    });
                    const { __language_code } = currentSession ? JSON.parse(currentSession.value) : {};
                    const translate = (key, ...args) => (0, i18n_1.i18n)(false).t(__language_code || "ru", key, ...args);
                    // Уведомляем собеседника
                    yield ctx.api.sendMessage(partnerUserId, translate('roulette_partner_left'), {
                        reply_markup: (0, keyboards_1.rouletteStartKeyboard)(translate)
                    });
                    // Получаем количество реакций для пользователя
                    const userReactionCounts = yield (0, getReactionCounts_1.getReactionCounts)(userId);
                    // Предлагаем собеседнику оценить пользователя
                    yield ctx.api.sendMessage(partnerUserId, translate('roulette_put_reaction_on_your_partner'), {
                        reply_markup: (0, keyboards_1.rouletteReactionKeyboard)(translate, userId, userReactionCounts)
                    });
                }
                if (existingUser.rouletteUser) {
                    yield postgres_1.prisma.rouletteUser.update({
                        where: { id: userId },
                        data: {
                            chatPartnerId: null,
                            searchingPartner: false,
                            usernameRevealed: false,
                            profileRevealed: false
                        }
                    });
                }
                yield ctx.reply(ctx.t('roulette_chat_ended'), {
                    reply_markup: (0, keyboards_1.rouletteStartKeyboard)(ctx.t)
                });
                // Предлагаем пользователю оценить собеседника
                if ((_f = existingUser.rouletteUser) === null || _f === void 0 ? void 0 : _f.chatPartnerId) {
                    // Получаем количество реакций для собеседника
                    const partnerReactionCounts = yield (0, getReactionCounts_1.getReactionCounts)(existingUser.rouletteUser.chatPartnerId);
                    yield ctx.reply(ctx.t('roulette_put_reaction_on_your_partner'), {
                        reply_markup: (0, keyboards_1.rouletteReactionKeyboard)(ctx.t, existingUser.rouletteUser.chatPartnerId, partnerReactionCounts)
                    });
                }
            }
            else if (message === ctx.t('roulette_reveal')) {
                const partnerId = (_g = existingUser.rouletteUser) === null || _g === void 0 ? void 0 : _g.chatPartnerId;
                ctx.logger.info({ userId, partnerId }, 'User requesting profile reveal');
                // Запрос на раскрытие профиля
                if (partnerId) {
                    // Проверяем, не был ли профиль уже раскрыт
                    if ((_h = existingUser.rouletteUser) === null || _h === void 0 ? void 0 : _h.profileRevealed) {
                        yield ctx.reply(ctx.t('roulette_profile_already_revealed'));
                        return;
                    }
                    const currentSession = yield postgres_1.prisma.session.findUnique({
                        where: {
                            key: partnerId
                        }
                    });
                    const { __language_code } = currentSession ? JSON.parse(currentSession.value) : {};
                    const translate = (key, ...args) => (0, i18n_1.i18n)(false).t(__language_code || "ru", key, ...args);
                    // Создаем клавиатуру для ответа на запрос о раскрытии
                    yield ctx.api.sendMessage(partnerId, translate('roulette_reveal_request'), {
                        reply_markup: (0, keyboards_1.confirmRevealKeyboard)(translate, userId)
                    });
                    // Уведомляем пользователя о том, что запрос был отправлен
                    yield ctx.reply(ctx.t('roulette_reveal_request_sent'));
                }
            }
            else if (message === ctx.t('roulette_reveal_username')) {
                const partnerId = (_j = existingUser.rouletteUser) === null || _j === void 0 ? void 0 : _j.chatPartnerId;
                ctx.logger.info({ userId, partnerId }, 'User requesting username reveal');
                // Запрос на раскрытие профиля
                if (partnerId) {
                    // Проверяем, не был ли username уже раскрыт
                    if ((_k = existingUser.rouletteUser) === null || _k === void 0 ? void 0 : _k.usernameRevealed) {
                        yield ctx.reply(ctx.t('roulette_username_already_revealed'));
                        return;
                    }
                    const currentSession = yield postgres_1.prisma.session.findUnique({
                        where: {
                            key: partnerId
                        }
                    });
                    const { __language_code } = currentSession ? JSON.parse(currentSession.value) : {};
                    const translate = (key, ...args) => (0, i18n_1.i18n)(false).t(__language_code || "ru", key, ...args);
                    // Создаем клавиатуру для ответа на запрос о раскрытии
                    yield ctx.api.sendMessage(partnerId, translate('roulette_reveal_username_request'), {
                        reply_markup: (0, keyboards_1.confirmRevealKeyboard)(translate, userId, true)
                    });
                    yield ctx.reply(ctx.t('roulette_reveal_username_request_sent'));
                }
            }
            else if (message === ctx.t('roulette_stop_searching')) {
                ctx.logger.info({ userId }, 'User stopped roulette search');
                // Проверяем наличие активного собеседника
                if ((_l = existingUser.rouletteUser) === null || _l === void 0 ? void 0 : _l.chatPartnerId) {
                    // Получаем информацию о статусе раскрытия для формирования клавиатуры
                    const profileRevealed = existingUser.rouletteUser.profileRevealed;
                    const usernameRevealed = existingUser.rouletteUser.usernameRevealed;
                    yield ctx.reply(ctx.t('roulette_you_have_partner'), {
                        reply_markup: (0, keyboards_1.rouletteKeyboard)(ctx.t, profileRevealed, usernameRevealed)
                    });
                }
                else {
                    yield postgres_1.prisma.rouletteUser.update({
                        where: { id: (_m = existingUser.rouletteUser) === null || _m === void 0 ? void 0 : _m.id },
                        data: {
                            chatPartnerId: null,
                            searchingPartner: false,
                            usernameRevealed: false,
                            profileRevealed: false
                        }
                    });
                    ctx.session.step = "roulette_start";
                    yield ctx.reply(ctx.t('roulette_stop_searching_success'), {
                        reply_markup: (0, keyboards_1.rouletteStartKeyboard)(ctx.t)
                    });
                }
            }
            else {
                // Пересылаем сообщение собеседнику
                if ((_o = existingUser.rouletteUser) === null || _o === void 0 ? void 0 : _o.chatPartnerId) {
                    try {
                        ctx.logger.info({ userId, partnerId: existingUser.rouletteUser.chatPartnerId }, 'Forwarding message to partner');
                        if ((_p = ctx.message) === null || _p === void 0 ? void 0 : _p.text) {
                            yield ctx.api.sendMessage(existingUser.rouletteUser.chatPartnerId, ctx.message.text);
                        }
                        else if ((_q = ctx.message) === null || _q === void 0 ? void 0 : _q.photo) {
                            yield ctx.api.sendPhoto(existingUser.rouletteUser.chatPartnerId, ctx.message.photo[0].file_id);
                        }
                        else if ((_r = ctx.message) === null || _r === void 0 ? void 0 : _r.video) {
                            yield ctx.api.sendVideo(existingUser.rouletteUser.chatPartnerId, ctx.message.video.file_id);
                        }
                        else if ((_s = ctx.message) === null || _s === void 0 ? void 0 : _s.voice) {
                            yield ctx.api.sendVoice(existingUser.rouletteUser.chatPartnerId, ctx.message.voice.file_id);
                        }
                        else if ((_t = ctx.message) === null || _t === void 0 ? void 0 : _t.video_note) {
                            yield ctx.api.sendVideoNote(existingUser.rouletteUser.chatPartnerId, ctx.message.video_note.file_id);
                        }
                        else if ((_u = ctx.message) === null || _u === void 0 ? void 0 : _u.sticker) {
                            yield ctx.api.sendSticker(existingUser.rouletteUser.chatPartnerId, ctx.message.sticker.file_id);
                        }
                        else if ((_v = ctx.message) === null || _v === void 0 ? void 0 : _v.animation) {
                            yield ctx.api.sendAnimation(existingUser.rouletteUser.chatPartnerId, ctx.message.animation.file_id);
                        }
                        else if ((_w = ctx.message) === null || _w === void 0 ? void 0 : _w.document) {
                            yield ctx.api.sendDocument(existingUser.rouletteUser.chatPartnerId, ctx.message.document.file_id);
                        }
                        else if ((_x = ctx.message) === null || _x === void 0 ? void 0 : _x.audio) {
                            yield ctx.api.sendAudio(existingUser.rouletteUser.chatPartnerId, ctx.message.audio.file_id);
                        }
                        else if ((_y = ctx.message) === null || _y === void 0 ? void 0 : _y.location) {
                            yield ctx.api.sendLocation(existingUser.rouletteUser.chatPartnerId, ctx.message.location.latitude, ctx.message.location.longitude);
                        }
                        else if ((_z = ctx.message) === null || _z === void 0 ? void 0 : _z.contact) {
                            yield ctx.api.sendContact(existingUser.rouletteUser.chatPartnerId, ctx.message.contact.phone_number, ctx.message.contact.first_name);
                        }
                    }
                    catch (error) {
                        ctx.logger.error({
                            error,
                            action: 'Error forwarding message in roulette',
                            userId: (_0 = ctx.message) === null || _0 === void 0 ? void 0 : _0.from.id,
                            partnerId: (_1 = existingUser.rouletteUser) === null || _1 === void 0 ? void 0 : _1.chatPartnerId,
                            message: ctx.message
                        });
                    }
                }
            }
        }
        else {
            ctx.logger.info({ userId }, 'User not found, redirecting to form creation');
            ctx.session.step = "you_dont_have_form";
            yield ctx.reply(ctx.t('you_dont_have_form'), {
                reply_markup: (0, keyboards_1.notHaveFormToDeactiveKeyboard)(ctx.t)
            });
        }
    });
}
