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
exports.disableFormStep = disableFormStep;
const keyboards_1 = require("./../constants/keyboards");
const keyboards_2 = require("../constants/keyboards");
const checkIsKeyboardOption_1 = require("../functions/checkIsKeyboardOption");
const profilesService_1 = require("../functions/db/profilesService");
function disableFormStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const message = ctx.message.text;
        const profiles = yield (0, profilesService_1.getUserProfiles)(String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id), ctx);
        if ((0, checkIsKeyboardOption_1.checkIsKeyboardOption)((0, keyboards_1.deactivateProfileKeyboard)(ctx.t, profiles), message)) {
            if (message === ctx.t("disable_all_profiles")) {
                ctx.session.step = 'form_disabled';
                profiles.forEach((profile) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    yield (0, profilesService_1.toggleProfileActive)(String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id), profile.profileType, false, profile.subType);
                }));
                yield ctx.reply(ctx.t('form_disabled_message'), {
                    reply_markup: (0, keyboards_2.formDisabledKeyboard)(ctx.t)
                });
            }
            else if (message === ctx.t('go_back')) {
                ctx.session.step = 'sleep_menu';
                yield ctx.reply(ctx.t('sleep_menu'), {
                    reply_markup: (0, keyboards_1.profileKeyboard)()
                });
            }
            else {
                const selectedProfile = profiles.find(profile => {
                    const profileTypeLocalizations = (0, profilesService_1.getProfileTypeLocalizations)(ctx.t);
                    const subtypeLocalizations = (0, profilesService_1.getSubtypeLocalizations)(ctx.t);
                    const profileTypeKey = Object.keys(profileTypeLocalizations).find(key => profileTypeLocalizations[key] === profile.profileType);
                    let profileSubtypeKey = '';
                    if (profile.subType) {
                        profileSubtypeKey = Object.keys(subtypeLocalizations[profile.profileType.toLowerCase()]).find(key => subtypeLocalizations[profile.profileType.toLowerCase()][key] === profile.subType) || '';
                    }
                    const profileString = `${profileTypeKey}${profile.subType ? `: ${profileSubtypeKey}` : ''}`;
                    return profileString === message;
                });
                if (selectedProfile) {
                    yield (0, profilesService_1.toggleProfileActive)(String((_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id), selectedProfile.profileType, false, selectedProfile.subType);
                }
                ctx.session.step = 'form_disabled';
                yield ctx.reply(ctx.t('form_disabled_message'), {
                    reply_markup: (0, keyboards_2.formDisabledKeyboard)(ctx.t)
                });
            }
        }
        else {
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.deactivateProfileKeyboard)(ctx.t, profiles)
            });
        }
    });
}
