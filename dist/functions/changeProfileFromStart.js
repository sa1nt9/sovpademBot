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
exports.changeProfileFromStart = changeProfileFromStart;
const keyboards_1 = require("../constants/keyboards");
const keyboards_2 = require("../constants/keyboards");
const keyboards_3 = require("../constants/keyboards");
const client_1 = require("@prisma/client");
const profilesService_1 = require("./db/profilesService");
const keyboards_4 = require("../constants/keyboards");
const gameLink_1 = require("./gameLink");
function changeProfileFromStart(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = ctx.message.text;
        const subtypeLocalizations = (0, profilesService_1.getSubtypeLocalizations)(ctx.t);
        ctx.session.step = "questions";
        ctx.session.isEditingProfile = true;
        if (ctx.session.activeProfile.profileType === client_1.ProfileType.SPORT) {
            ctx.session.activeProfile.subType = subtypeLocalizations.sport[message];
            ctx.session.question = 'sport_level';
            yield ctx.reply(ctx.t('sport_level_question'), {
                reply_markup: (0, keyboards_4.selectSportLevelkeyboard)(ctx.t)
            });
        }
        else if (ctx.session.activeProfile.profileType === client_1.ProfileType.IT) {
            ctx.session.activeProfile.subType = subtypeLocalizations.it[message];
            ctx.session.question = 'it_experience';
            yield ctx.reply(ctx.t('it_experience_question'), {
                reply_markup: (0, keyboards_3.selectItExperienceKeyboard)(ctx.t)
            });
        }
        else if (ctx.session.activeProfile.profileType === client_1.ProfileType.GAME) {
            ctx.session.activeProfile.subType = subtypeLocalizations.game[message];
            ctx.session.question = 'game_account';
            yield ctx.reply(ctx.t(gameLink_1.gameLocalizationKeys[ctx.session.activeProfile.subType]), {
                reply_markup: (0, keyboards_2.gameAccountKeyboard)(ctx.t, ctx.session)
            });
        }
        else if (ctx.session.activeProfile.profileType === client_1.ProfileType.HOBBY) {
            ctx.session.activeProfile.subType = subtypeLocalizations.hobby[message];
            ctx.session.question = 'years';
            yield ctx.reply(ctx.t('years_question'), {
                reply_markup: (0, keyboards_1.ageKeyboard)(ctx.session)
            });
        }
        else {
            ctx.session.question = 'years';
            yield ctx.reply(ctx.t('years_question'), {
                reply_markup: (0, keyboards_1.ageKeyboard)(ctx.session)
            });
        }
    });
}
