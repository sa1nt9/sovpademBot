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
    var _a, _b, _c, _d, _e;
    const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
    const startParam = (_c = (_b = ctx.message) === null || _b === void 0 ? void 0 : _b.text) === null || _c === void 0 ? void 0 : _c.split(' ')[1];
    ctx.logger.info({
        userId,
        username: (_d = ctx.from) === null || _d === void 0 ? void 0 : _d.username,
        startParam,
        isNewUser: !((_e = ctx.session) === null || _e === void 0 ? void 0 : _e.step)
    }, 'Processing start command');
    const existingUser = yield postgres_1.prisma.user.findUnique({
        where: { id: userId },
    });
    ctx.logger.info({
        userId,
        isExistingUser: !!existingUser,
        referrerId: ctx.session.referrerId
    }, 'User lookup completed');
    if (startParam === null || startParam === void 0 ? void 0 : startParam.startsWith('i_')) {
        const encodedReferrerId = startParam.substring(2);
        if (encodedReferrerId) {
            try {
                const referrerId = (0, encodeId_1.decodeId)(encodedReferrerId);
                if (referrerId && referrerId !== userId) {
                    if (!existingUser) {
                        ctx.session.referrerId = referrerId;
                        ctx.logger.info({
                            userId,
                            referrerId,
                            encodedReferrerId
                        }, 'Referrer ID set for new user');
                    }
                }
            }
            catch (error) {
                ctx.logger.error({
                    userId,
                    encodedReferrerId,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined
                }, 'Error decoding referrer ID');
            }
        }
    }
    if (startParam === null || startParam === void 0 ? void 0 : startParam.startsWith('profile_')) {
        const encodedId = startParam.substring(8);
        if (encodedId) {
            try {
                const profileUserId = (0, encodeId_1.decodeId)(encodedId);
                if (profileUserId) {
                    ctx.logger.info({
                        userId,
                        profileUserId,
                        encodedId
                    }, 'Processing profile view request');
                    const user = yield postgres_1.prisma.user.findUnique({
                        where: { id: profileUserId },
                    });
                    if (user && (user === null || user === void 0 ? void 0 : user.id) !== (existingUser === null || existingUser === void 0 ? void 0 : existingUser.id)) {
                        if (existingUser === null || existingUser === void 0 ? void 0 : existingUser.id) {
                            ctx.session.step = "go_main_menu";
                        }
                        else {
                            ctx.session.step = "start_using_bot";
                        }
                        ctx.logger.info({
                            userId,
                            profileUserId,
                            step: ctx.session.step
                        }, 'Sending profile view');
                        yield ctx.reply(ctx.t('this_is_user_profile'), {
                            reply_markup: (existingUser === null || existingUser === void 0 ? void 0 : existingUser.id) ? (0, keyboards_1.mainMenuKeyboard)(ctx.t) : (0, keyboards_1.createFormKeyboard)(ctx.t)
                        });
                        yield (0, sendForm_1.sendForm)(ctx, user, { myForm: false });
                        return;
                    }
                    else if ((user === null || user === void 0 ? void 0 : user.id) !== (existingUser === null || existingUser === void 0 ? void 0 : existingUser.id)) {
                        ctx.logger.warn({
                            userId,
                            profileUserId
                        }, 'Profile not found');
                        yield ctx.reply(ctx.t('user_not_found'));
                    }
                }
            }
            catch (error) {
                ctx.logger.error({
                    userId,
                    encodedId,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined
                }, 'Error decoding profile ID');
            }
        }
    }
    if (existingUser) {
        ctx.session.step = "profile";
        ctx.logger.info({
            userId,
            step: ctx.session.step
        }, 'Sending profile for existing user');
        yield (0, sendForm_1.sendForm)(ctx);
        yield ctx.reply(ctx.t('profile_menu'), {
            reply_markup: (0, keyboards_1.profileKeyboard)()
        });
    }
    else {
        ctx.session.step = "choose_language_start";
        ctx.logger.info({
            userId,
            step: ctx.session.step
        }, 'Starting language selection for new user');
        yield ctx.reply(ctx.t('choose_language'), {
            reply_markup: keyboards_1.languageKeyboard
        });
    }
});
exports.startCommand = startCommand;
