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
exports.myprofileCommand = void 0;
const keyboards_1 = require("./../constants/keyboards");
const keyboards_2 = require("../constants/keyboards");
const postgres_1 = require("../db/postgres");
const sendForm_1 = require("../functions/sendForm");
const restoreProfileValues_1 = require("../functions/restoreProfileValues");
const myprofileCommand = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
    ctx.logger.info({
        userId,
        username: (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.username,
        isEditingProfile: ctx.session.isEditingProfile,
        privacyAccepted: ctx.session.privacyAccepted
    }, 'Processing myprofile command');
    const existingUser = yield postgres_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (existingUser) {
        if (ctx.session.isEditingProfile) {
            ctx.session.isEditingProfile = false;
            ctx.logger.info({
                userId,
                action: 'restore_profile'
            }, 'Restoring profile values');
            yield (0, restoreProfileValues_1.restoreProfileValues)(ctx);
        }
        ctx.session.step = "profile";
        ctx.logger.info({
            userId,
            step: ctx.session.step
        }, 'Sending profile for existing user');
        yield (0, sendForm_1.sendForm)(ctx);
        yield ctx.reply(ctx.t('profile_menu'), {
            reply_markup: (0, keyboards_2.profileKeyboard)()
        });
    }
    else {
        if (ctx.session.privacyAccepted) {
            ctx.session.step = "create_profile_type";
            ctx.session.isCreatingProfile = true;
            ctx.logger.info({
                userId,
                step: ctx.session.step
            }, 'Starting profile creation for new user');
            yield ctx.reply(ctx.t('profile_type_title'), {
                reply_markup: (0, keyboards_1.createProfileTypeKeyboard)(ctx.t)
            });
        }
        else {
            ctx.session.step = "accept_privacy";
            ctx.logger.info({
                userId,
                step: ctx.session.step
            }, 'Showing privacy policy for new user');
            yield ctx.reply(ctx.t('privacy_message'), {
                reply_markup: (0, keyboards_2.acceptPrivacyKeyboard)(ctx.t),
            });
        }
    }
});
exports.myprofileCommand = myprofileCommand;
