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
const findRouletteUser_1 = require("../functions/findRouletteUser");
const getReactionCounts_1 = require("../functions/getReactionCounts");
function rouletteSearchingStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
        const message = ctx.message.text;
        const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
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
            if (message === ctx.t('roulette_next') || message === ctx.t('roulette_find')) {
                // Если был предыдущий собеседник, разрываем связь
                if ((_b = existingUser.rouletteUser) === null || _b === void 0 ? void 0 : _b.chatPartnerId) {
                    const prevPartnerId = existingUser.rouletteUser.chatPartnerId;
                    yield postgres_1.prisma.rouletteUser.update({
                        where: { id: prevPartnerId },
                        data: {
                            chatPartnerId: null,
                            searchingPartner: false,
                            usernameRevealed: false,
                            profileRevealed: false
                        }
                    });
                    // Уведомляем предыдущего собеседника
                    yield ctx.api.sendMessage(prevPartnerId, ctx.t('roulette_partner_left'), {
                        reply_markup: (0, keyboards_1.rouletteStartKeyboard)(ctx.t)
                    });
                    // Получаем количество реакций для пользователя
                    const userReactionCounts = yield (0, getReactionCounts_1.getReactionCounts)(userId);
                    // Предлагаем собеседнику оценить пользователя
                    yield ctx.api.sendMessage(prevPartnerId, ctx.t('roulette_put_reaction_on_your_partner'), {
                        reply_markup: (0, keyboards_1.rouletteReactionKeyboard)(ctx.t, userId, userReactionCounts)
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
                yield (0, findRouletteUser_1.findRouletteUser)(ctx);
            }
            else if (message === ctx.t('roulette_stop')) {
                ctx.logger.info({
                    action: 'Roulette stop',
                    userId: userId
                });
                // Завершаем чат
                const partnerUserId = (_c = existingUser.rouletteUser) === null || _c === void 0 ? void 0 : _c.chatPartnerId;
                if (partnerUserId) {
                    yield postgres_1.prisma.rouletteUser.update({
                        where: { id: partnerUserId },
                        data: {
                            chatPartnerId: null,
                            searchingPartner: false,
                            usernameRevealed: false,
                            profileRevealed: false
                        }
                    });
                    // Уведомляем собеседника
                    yield ctx.api.sendMessage(partnerUserId, ctx.t('roulette_partner_left'), {
                        reply_markup: (0, keyboards_1.rouletteStartKeyboard)(ctx.t)
                    });
                    // Получаем количество реакций для пользователя
                    const userReactionCounts = yield (0, getReactionCounts_1.getReactionCounts)(userId);
                    // Предлагаем собеседнику оценить пользователя
                    yield ctx.api.sendMessage(partnerUserId, ctx.t('roulette_put_reaction_on_your_partner'), {
                        reply_markup: (0, keyboards_1.rouletteReactionKeyboard)(ctx.t, userId, userReactionCounts)
                    });
                }
                // Удаляем запись из RouletteUser
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
                if ((_d = existingUser.rouletteUser) === null || _d === void 0 ? void 0 : _d.chatPartnerId) {
                    // Получаем количество реакций для собеседника
                    const partnerReactionCounts = yield (0, getReactionCounts_1.getReactionCounts)(existingUser.rouletteUser.chatPartnerId);
                    yield ctx.reply(ctx.t('roulette_put_reaction_on_your_partner'), {
                        reply_markup: (0, keyboards_1.rouletteReactionKeyboard)(ctx.t, existingUser.rouletteUser.chatPartnerId, partnerReactionCounts)
                    });
                }
            }
            else if (message === ctx.t('roulette_reveal')) {
                // Запрос на раскрытие профиля
                if ((_e = existingUser.rouletteUser) === null || _e === void 0 ? void 0 : _e.chatPartnerId) {
                    // Проверяем, не был ли профиль уже раскрыт
                    if (existingUser.rouletteUser.profileRevealed) {
                        yield ctx.reply(ctx.t('roulette_profile_already_revealed'));
                        return;
                    }
                    // Создаем клавиатуру для ответа на запрос о раскрытии
                    yield ctx.api.sendMessage(existingUser.rouletteUser.chatPartnerId, ctx.t('roulette_reveal_request'), {
                        reply_markup: (0, keyboards_1.confirmRevealKeyboard)(ctx.t, userId)
                    });
                    // Уведомляем пользователя о том, что запрос был отправлен
                    yield ctx.reply(ctx.t('roulette_reveal_request_sent'));
                }
            }
            else if (message === ctx.t('roulette_reveal_username')) {
                // Запрос на раскрытие профиля
                if ((_f = existingUser.rouletteUser) === null || _f === void 0 ? void 0 : _f.chatPartnerId) {
                    // Проверяем, не был ли username уже раскрыт
                    if (existingUser.rouletteUser.usernameRevealed) {
                        yield ctx.reply(ctx.t('roulette_username_already_revealed'));
                        return;
                    }
                    // Создаем клавиатуру для ответа на запрос о раскрытии
                    yield ctx.api.sendMessage(existingUser.rouletteUser.chatPartnerId, ctx.t('roulette_reveal_username_request'), {
                        reply_markup: (0, keyboards_1.confirmRevealKeyboard)(ctx.t, userId, true)
                    });
                    yield ctx.reply(ctx.t('roulette_reveal_username_request_sent'));
                }
            }
            else if (message === ctx.t('roulette_stop_searching')) {
                // Запрос на раскрытие профиля
                if ((_g = existingUser.rouletteUser) === null || _g === void 0 ? void 0 : _g.chatPartnerId) {
                    // Получаем информацию о статусе раскрытия для формирования клавиатуры
                    const profileRevealed = existingUser.rouletteUser.profileRevealed;
                    const usernameRevealed = existingUser.rouletteUser.usernameRevealed;
                    yield ctx.reply(ctx.t('roulette_you_have_partner'), {
                        reply_markup: (0, keyboards_1.rouletteKeyboard)(ctx.t, profileRevealed, usernameRevealed)
                    });
                }
                else {
                    yield postgres_1.prisma.rouletteUser.update({
                        where: { id: (_h = existingUser.rouletteUser) === null || _h === void 0 ? void 0 : _h.id },
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
                if ((_j = existingUser.rouletteUser) === null || _j === void 0 ? void 0 : _j.chatPartnerId) {
                    try {
                        if ((_k = ctx.message) === null || _k === void 0 ? void 0 : _k.text) {
                            yield ctx.api.sendMessage(existingUser.rouletteUser.chatPartnerId, ctx.message.text);
                        }
                        else if ((_l = ctx.message) === null || _l === void 0 ? void 0 : _l.photo) {
                            yield ctx.api.sendPhoto(existingUser.rouletteUser.chatPartnerId, ctx.message.photo[0].file_id);
                        }
                        else if ((_m = ctx.message) === null || _m === void 0 ? void 0 : _m.video) {
                            yield ctx.api.sendVideo(existingUser.rouletteUser.chatPartnerId, ctx.message.video.file_id);
                        }
                        else if ((_o = ctx.message) === null || _o === void 0 ? void 0 : _o.voice) {
                            yield ctx.api.sendVoice(existingUser.rouletteUser.chatPartnerId, ctx.message.voice.file_id);
                        }
                        else if ((_p = ctx.message) === null || _p === void 0 ? void 0 : _p.video_note) {
                            yield ctx.api.sendVideoNote(existingUser.rouletteUser.chatPartnerId, ctx.message.video_note.file_id);
                        }
                        else if ((_q = ctx.message) === null || _q === void 0 ? void 0 : _q.sticker) {
                            yield ctx.api.sendSticker(existingUser.rouletteUser.chatPartnerId, ctx.message.sticker.file_id);
                        }
                        else if ((_r = ctx.message) === null || _r === void 0 ? void 0 : _r.animation) {
                            yield ctx.api.sendAnimation(existingUser.rouletteUser.chatPartnerId, ctx.message.animation.file_id);
                        }
                        else if ((_s = ctx.message) === null || _s === void 0 ? void 0 : _s.document) {
                            yield ctx.api.sendDocument(existingUser.rouletteUser.chatPartnerId, ctx.message.document.file_id);
                        }
                        else if ((_t = ctx.message) === null || _t === void 0 ? void 0 : _t.audio) {
                            yield ctx.api.sendAudio(existingUser.rouletteUser.chatPartnerId, ctx.message.audio.file_id);
                        }
                        else if ((_u = ctx.message) === null || _u === void 0 ? void 0 : _u.location) {
                            yield ctx.api.sendLocation(existingUser.rouletteUser.chatPartnerId, ctx.message.location.latitude, ctx.message.location.longitude);
                        }
                        else if ((_v = ctx.message) === null || _v === void 0 ? void 0 : _v.contact) {
                            yield ctx.api.sendContact(existingUser.rouletteUser.chatPartnerId, ctx.message.contact.phone_number, ctx.message.contact.first_name);
                        }
                    }
                    catch (error) {
                        ctx.logger.error({
                            error,
                            action: 'Error forwarding message in roulette',
                            userId: (_w = ctx.message) === null || _w === void 0 ? void 0 : _w.from.id,
                            partnerId: (_x = existingUser.rouletteUser) === null || _x === void 0 ? void 0 : _x.chatPartnerId,
                            message: ctx.message
                        });
                    }
                }
            }
        }
        else {
            ctx.session.step = "you_dont_have_form";
            yield ctx.reply(ctx.t('you_dont_have_form'), {
                reply_markup: (0, keyboards_1.notHaveFormToDeactiveKeyboard)(ctx.t)
            });
        }
    });
}
