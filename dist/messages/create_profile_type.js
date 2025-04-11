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
exports.createProfileTypeStep = createProfileTypeStep;
const client_1 = require("@prisma/client");
const keyboards_1 = require("../constants/keyboards");
const profilesService_1 = require("../functions/db/profilesService");
function createProfileTypeStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const message = ctx.message.text;
        if (message && message in (0, profilesService_1.getProfileTypeLocalizations)(ctx.t)) {
            const profileType = (0, profilesService_1.getProfileTypeLocalizations)(ctx.t)[message];
            if (profileType === client_1.ProfileType.RELATIONSHIP) {
                const existingProfile = yield (0, profilesService_1.getUserProfile)(String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id), client_1.ProfileType.RELATIONSHIP);
                if (existingProfile) {
                    ctx.session.step = 'you_already_have_this_profile';
                    ctx.session.additionalFormInfo.selectedProfileType = profileType;
                    yield ctx.reply(ctx.t('you_already_have_this_profile'), {
                        reply_markup: (0, keyboards_1.youAlreadyHaveThisProfileKeyboard)(ctx.t)
                    });
                    return;
                }
            }
            ctx.session.activeProfile.profileType = profileType;
            ctx.session.step = 'create_profile_subtype';
            const text = ctx.t(`${profileType.toLowerCase()}_type_title`);
            if (profileType === client_1.ProfileType.RELATIONSHIP) {
                ctx.session.step = "questions";
                ctx.session.isEditingProfile = true;
                ctx.session.question = 'years';
                yield ctx.reply(ctx.t('years_question'), {
                    reply_markup: (0, keyboards_1.ageKeyboard)(ctx.session)
                });
            }
            else {
                yield ctx.reply(text, {
                    reply_markup: (0, keyboards_1.createProfileSubtypeKeyboard)(ctx.t, profileType)
                });
            }
        }
        else {
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.createProfileTypeKeyboard)(ctx.t)
            });
        }
    });
}
