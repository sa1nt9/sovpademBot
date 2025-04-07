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
exports.startCommand = void 0;
const keyboards_1 = require("../constants/keyboards");
const postgres_1 = require("../db/postgres");
const encodeId_1 = require("../functions/encodeId");
const sendForm_1 = require("../functions/sendForm");
const startCommand = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
    const startParam = (_c = (_b = ctx.message) === null || _b === void 0 ? void 0 : _b.text) === null || _c === void 0 ? void 0 : _c.split(' ')[1];
    const existingUser = yield postgres_1.prisma.user.findUnique({
        where: { id: userId },
    });
    ctx.logger.info({
        msg: 'start',
        existingUser: existingUser
    });
    if (startParam === null || startParam === void 0 ? void 0 : startParam.startsWith('i_')) {
        const encodedReferrerId = startParam.substring(2);
        if (encodedReferrerId) {
            try {
                const referrerId = (0, encodeId_1.decodeId)(encodedReferrerId);
                if (referrerId && referrerId !== userId) {
                    if (!existingUser) {
                        ctx.session.referrerId = referrerId;
                    }
                }
            }
            catch (error) {
                ctx.logger.error({
                    msg: 'Error decoding referrer ID',
                    error: error
                });
            }
        }
    }
    if (startParam === null || startParam === void 0 ? void 0 : startParam.startsWith('profile_')) {
        const encodedId = startParam.substring(8);
        if (encodedId) {
            try {
                const userId = (0, encodeId_1.decodeId)(encodedId);
                if (userId) {
                    const user = yield postgres_1.prisma.user.findUnique({
                        where: { id: userId },
                    });
                    if (user && (user === null || user === void 0 ? void 0 : user.id) !== (existingUser === null || existingUser === void 0 ? void 0 : existingUser.id)) {
                        if (existingUser === null || existingUser === void 0 ? void 0 : existingUser.id) {
                            ctx.session.step = "go_main_menu";
                        }
                        else {
                            ctx.session.step = "start_using_bot";
                        }
                        yield ctx.reply(ctx.t('this_is_user_profile'), {
                            reply_markup: (existingUser === null || existingUser === void 0 ? void 0 : existingUser.id) ? (0, keyboards_1.mainMenuKeyboard)(ctx.t) : (0, keyboards_1.createFormKeyboard)(ctx.t)
                        });
                        yield (0, sendForm_1.sendForm)(ctx, user, { myForm: false });
                        return;
                    }
                    else if ((user === null || user === void 0 ? void 0 : user.id) !== (existingUser === null || existingUser === void 0 ? void 0 : existingUser.id)) {
                        yield ctx.reply(ctx.t('user_not_found'));
                    }
                }
            }
            catch (error) {
                ctx.logger.error({
                    msg: 'Error decoding ID',
                    error: error
                });
            }
        }
    }
    if (existingUser) {
        ctx.session.step = "profile";
        yield (0, sendForm_1.sendForm)(ctx);
        yield ctx.reply(ctx.t('profile_menu'), {
            reply_markup: (0, keyboards_1.profileKeyboard)()
        });
    }
    else {
        ctx.session.step = "choose_language_start";
        yield ctx.reply(ctx.t('choose_language'), {
            reply_markup: keyboards_1.languageKeyboard
        });
    }
});
exports.startCommand = startCommand;
