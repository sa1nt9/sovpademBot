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
        const subtypeLocalizations = (0, profilesService_1.getSubtypeLocalizations)(ctx.t);
        if (message && Object.keys(subtypeLocalizations[ctx.session.activeProfile.profileType.toLowerCase()]).includes(message)) {
            const profileType = ctx.session.activeProfile.profileType;
            const subType = subtypeLocalizations[profileType.toLowerCase()][message];
            const existingProfile = yield (0, profilesService_1.getUserProfile)(String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id), profileType, subType);
            if (existingProfile) {
                ctx.session.step = 'you_already_have_this_profile';
                ctx.session.additionalFormInfo.selectedProfileType = profileType;
                ctx.session.additionalFormInfo.selectedSubType = subType;
                yield ctx.reply(ctx.t('you_already_have_this_profile'), {
                    reply_markup: (0, keyboards_1.youAlreadyHaveThisProfileKeyboard)(ctx.t)
                });
                return;
            }
            yield (0, changeProfileFromStart_1.changeProfileFromStart)(ctx);
        }
        else {
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.createProfileSubtypeKeyboard)(ctx.t, ctx.session.activeProfile.profileType)
            });
        }
    });
}
