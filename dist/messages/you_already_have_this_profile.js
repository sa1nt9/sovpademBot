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
exports.youAlreadyHaveThisProfileStep = void 0;
const client_1 = require("@prisma/client");
const keyboards_1 = require("../constants/keyboards");
const profilesService_1 = require("../functions/db/profilesService");
const sendForm_1 = require("../functions/sendForm");
const youAlreadyHaveThisProfileStep = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const message = ctx.message.text;
    const userId = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
    ctx.logger.info({
        userId,
        step: 'you_already_have_this_profile',
        profileType: ctx.session.additionalFormInfo.selectedProfileType,
        subType: ctx.session.additionalFormInfo.selectedSubType
    }, 'User has profile conflict');
    if (message === ctx.t('switch_to_this_profile')) {
        ctx.logger.info({
            userId,
            profileType: ctx.session.additionalFormInfo.selectedProfileType,
            subType: ctx.session.additionalFormInfo.selectedSubType
        }, 'User switching to existing profile');
        const fullProfile = yield (0, profilesService_1.getUserProfile)(String((_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id), ctx.session.additionalFormInfo.selectedProfileType || client_1.ProfileType.SPORT, ctx.session.additionalFormInfo.selectedSubType);
        if (fullProfile) {
            ctx.session.activeProfile = Object.assign(Object.assign({}, ctx.session.activeProfile), fullProfile);
            ctx.session.step = "profile";
            yield (0, sendForm_1.sendForm)(ctx);
            yield ctx.reply(ctx.t('profile_menu'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
    }
    else if (message === ctx.t('create_new_profile')) {
        ctx.logger.info({ userId }, 'User selecting to create a different profile type');
        ctx.session.step = "create_profile_type";
        ctx.session.isCreatingProfile = true;
        yield ctx.reply(ctx.t('profile_type_title'), {
            reply_markup: (0, keyboards_1.createProfileTypeKeyboard)(ctx.t)
        });
    }
    else if (message === ctx.t('main_menu')) {
        ctx.logger.info({ userId }, 'User returning to main menu from profile conflict');
        ctx.session.step = "profile";
        yield (0, sendForm_1.sendForm)(ctx);
        yield ctx.reply(ctx.t('profile_menu'), {
            reply_markup: (0, keyboards_1.profileKeyboard)()
        });
    }
    else {
        ctx.logger.warn({ userId, invalidOption: message }, 'User provided invalid response in profile conflict screen');
        yield ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: (0, keyboards_1.youAlreadyHaveThisProfileKeyboard)(ctx.t)
        });
    }
});
exports.youAlreadyHaveThisProfileStep = youAlreadyHaveThisProfileStep;
