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
exports.switchProfileStep = void 0;
const keyboards_1 = require("../constants/keyboards");
const checkIsKeyboardOption_1 = require("../functions/checkIsKeyboardOption");
const profilesService_1 = require("../functions/db/profilesService");
const sendForm_1 = require("../functions/sendForm");
const keyboards_2 = require("../constants/keyboards");
const switchProfileStep = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const message = ctx.message.text;
    const userId = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
    if (message === ctx.t('go_back')) {
        ctx.session.step = 'sleep_menu';
        yield ctx.reply(ctx.t('sleep_menu'), {
            reply_markup: (0, keyboards_2.profileKeyboard)()
        });
    }
    else if (message === ctx.t('create_new_profile')) {
        ctx.session.step = "create_profile_type";
        ctx.session.isCreatingProfile = true;
        yield ctx.reply(ctx.t('profile_type_title'), {
            reply_markup: (0, keyboards_1.createProfileTypeKeyboard)(ctx.t)
        });
    }
    else {
        const profiles = yield (0, profilesService_1.getUserProfiles)(userId, ctx);
        if ((0, checkIsKeyboardOption_1.checkIsKeyboardOption)((0, keyboards_1.switchProfileKeyboard)(ctx.t, profiles), message)) {
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
                const fullProfile = yield (0, profilesService_1.getUserProfile)(userId, selectedProfile.profileType, selectedProfile.subType);
                if (fullProfile) {
                    ctx.session.activeProfile = Object.assign(Object.assign({}, ctx.session.activeProfile), fullProfile);
                    ctx.session.step = "profile";
                    yield (0, sendForm_1.sendForm)(ctx);
                    yield ctx.reply(ctx.t('profile_menu'), {
                        reply_markup: (0, keyboards_2.profileKeyboard)()
                    });
                }
            }
        }
        else {
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.switchProfileKeyboard)(ctx.t, profiles)
            });
        }
    }
});
exports.switchProfileStep = switchProfileStep;
