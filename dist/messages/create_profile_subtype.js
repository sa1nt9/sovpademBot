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
exports.createProfileSubtypeStep = createProfileSubtypeStep;
const keyboards_1 = require("../constants/keyboards");
const profilesService_1 = require("../functions/db/profilesService");
const changeProfileFromStart_1 = require("../functions/changeProfileFromStart");
function createProfileSubtypeStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const message = ctx.message.text;
        const userId = String(ctx.from.id);
        const subtypeLocalizations = (0, profilesService_1.getSubtypeLocalizations)(ctx.t);
        ctx.logger.info({
            userId,
            step: 'create_profile_subtype',
            profileType: ctx.session.additionalFormInfo.selectedProfileType,
            message
        }, 'User selecting profile subtype');
        if (message && Object.keys(subtypeLocalizations[ctx.session.additionalFormInfo.selectedProfileType.toLowerCase()]).includes(message)) {
            const profileType = ctx.session.additionalFormInfo.selectedProfileType;
            const subType = subtypeLocalizations[profileType === null || profileType === void 0 ? void 0 : profileType.toLowerCase()][message];
            ctx.session.additionalFormInfo.selectedSubType = subType;
            ctx.logger.info({ userId, profileType, subType }, 'Profile subtype selected');
            const existingProfile = yield (0, profilesService_1.getUserProfile)(String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id), profileType, subType);
            if (existingProfile) {
                ctx.logger.info({ userId, profileType, subType }, 'User already has this profile type/subtype');
                ctx.session.step = 'you_already_have_this_profile';
                yield ctx.reply(ctx.t('you_already_have_this_profile'), {
                    reply_markup: (0, keyboards_1.youAlreadyHaveThisProfileKeyboard)(ctx.t)
                });
                return;
            }
            ctx.logger.info({ userId, profileType, subType }, 'Starting profile creation process');
            yield (0, changeProfileFromStart_1.changeProfileFromStart)(ctx);
        }
        else {
            ctx.logger.warn({
                userId,
                invalidOption: message,
                profileType: ctx.session.additionalFormInfo.selectedProfileType
            }, 'User selected invalid profile subtype');
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.createProfileSubtypeKeyboard)(ctx.t, ctx.session.additionalFormInfo.selectedProfileType)
            });
        }
    });
}
