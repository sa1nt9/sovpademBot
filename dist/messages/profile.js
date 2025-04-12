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
exports.profileStep = profileStep;
const keyboards_1 = require("../constants/keyboards");
const getCandidate_1 = require("../functions/db/getCandidate");
const sendForm_1 = require("../functions/sendForm");
const roulette_start_1 = require("./roulette_start");
const candidatesEnded_1 = require("../functions/candidatesEnded");
const changeProfileFromStart_1 = require("../functions/changeProfileFromStart");
const profilesService_1 = require("../functions/db/profilesService");
const startSearchingPeople_1 = require("../functions/startSearchingPeople");
const client_1 = require("@prisma/client");
function profileStep(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = ctx.message.text;
        const userId = String(ctx.message.from.id);
        if (message === '1 🚀') {
            yield (0, startSearchingPeople_1.startSearchingPeople)(ctx, { setActive: true });
            const candidate = yield (0, getCandidate_1.getCandidate)(ctx);
            ctx.logger.info(candidate, 'This is new candidate');
            if (candidate) {
                yield (0, sendForm_1.sendForm)(ctx, candidate || null, { myForm: false });
            }
            else {
                yield (0, candidatesEnded_1.candidatesEnded)(ctx);
            }
        }
        else if (message === '2') {
            ctx.session.isEditingProfile = true;
            ctx.session.additionalFormInfo.selectedProfileType = ctx.session.activeProfile.profileType;
            if (ctx.session.activeProfile.profileType !== client_1.ProfileType.RELATIONSHIP) {
                ctx.session.additionalFormInfo.selectedSubType = ctx.session.activeProfile.subType;
            }
            yield (0, changeProfileFromStart_1.changeProfileFromStart)(ctx);
        }
        else if (message === '3') {
            ctx.session.step = 'questions';
            ctx.session.question = 'file';
            ctx.session.additionalFormInfo.selectedProfileType = ctx.session.activeProfile.profileType;
            if (ctx.session.activeProfile.profileType !== client_1.ProfileType.RELATIONSHIP) {
                ctx.session.additionalFormInfo.selectedSubType = ctx.session.activeProfile.subType;
            }
            ctx.session.additionalFormInfo.canGoBack = true;
            yield ctx.reply(ctx.t('file_question'), {
                reply_markup: (0, keyboards_1.fileKeyboard)(ctx.t, ctx.session, true)
            });
        }
        else if (message === '4') {
            ctx.session.step = 'questions';
            ctx.session.question = "text";
            ctx.session.additionalFormInfo.selectedProfileType = ctx.session.activeProfile.profileType;
            if (ctx.session.activeProfile.profileType !== client_1.ProfileType.RELATIONSHIP) {
                ctx.session.additionalFormInfo.selectedSubType = ctx.session.activeProfile.subType;
            }
            ctx.session.additionalFormInfo.canGoBack = true;
            yield ctx.reply(ctx.t('text_question', {
                profileType: ctx.session.activeProfile.profileType
            }), {
                reply_markup: (0, keyboards_1.textKeyboard)(ctx.t, ctx.session)
            });
        }
        else if (message === '5') {
            ctx.session.step = "switch_profile";
            const profiles = yield (0, profilesService_1.getUserProfiles)(userId, ctx);
            yield ctx.reply(ctx.t('switch_profile_message'), {
                reply_markup: (0, keyboards_1.switchProfileKeyboard)(ctx.t, profiles)
            });
        }
        else if (message === '6 🎲') {
            ctx.session.step = 'roulette_start';
            yield (0, roulette_start_1.showRouletteStart)(ctx);
        }
        else {
            yield ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: (0, keyboards_1.profileKeyboard)()
            });
        }
    });
}
