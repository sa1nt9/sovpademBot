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
        var _a;
        const userId = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
        const message = ctx.message.text;
        const subtypeLocalizations = (0, profilesService_1.getSubtypeLocalizations)(ctx.t);
        ctx.logger.info({
            userId,
            message,
            profileType: ctx.session.additionalFormInfo.selectedProfileType,
            isEditing: ctx.session.isEditingProfile
        }, 'Starting profile change from start');
        ctx.session.step = "questions";
        if (ctx.session.additionalFormInfo.selectedProfileType === client_1.ProfileType.SPORT) {
            if (!ctx.session.isEditingProfile) {
                ctx.session.additionalFormInfo.selectedSubType = subtypeLocalizations.sport[message];
                ctx.logger.info({
                    userId,
                    subType: ctx.session.additionalFormInfo.selectedSubType
                }, 'Selected sport subtype');
            }
            ctx.session.question = 'sport_level';
            yield ctx.reply(ctx.t('sport_level_question'), {
                reply_markup: (0, keyboards_4.selectSportLevelkeyboard)(ctx.t)
            });
        }
        else if (ctx.session.additionalFormInfo.selectedProfileType === client_1.ProfileType.IT) {
            if (!ctx.session.isEditingProfile) {
                ctx.session.additionalFormInfo.selectedSubType = subtypeLocalizations.it[message];
                ctx.logger.info({
                    userId,
                    subType: ctx.session.additionalFormInfo.selectedSubType
                }, 'Selected IT subtype');
            }
            ctx.session.question = 'it_experience';
            yield ctx.reply(ctx.t('it_experience_question'), {
                reply_markup: (0, keyboards_3.selectItExperienceKeyboard)(ctx.t)
            });
        }
        else if (ctx.session.additionalFormInfo.selectedProfileType === client_1.ProfileType.GAME) {
            if (!ctx.session.isEditingProfile) {
                ctx.session.additionalFormInfo.selectedSubType = subtypeLocalizations.game[message];
                ctx.logger.info({
                    userId,
                    subType: ctx.session.additionalFormInfo.selectedSubType
                }, 'Selected game subtype');
            }
            ctx.session.question = 'game_account';
            if (ctx.session.additionalFormInfo.selectedSubType) {
                yield ctx.reply(ctx.t(gameLink_1.gameLocalizationKeys[ctx.session.additionalFormInfo.selectedSubType]), {
                    reply_markup: (0, keyboards_2.gameAccountKeyboard)(ctx.t, ctx.session)
                });
            }
        }
        else if (ctx.session.additionalFormInfo.selectedProfileType === client_1.ProfileType.HOBBY) {
            ctx.session.additionalFormInfo.selectedSubType = subtypeLocalizations.hobby[message];
            ctx.logger.info({
                userId,
                subType: ctx.session.additionalFormInfo.selectedSubType
            }, 'Selected hobby subtype');
            ctx.session.question = 'years';
            yield ctx.reply(ctx.t('years_question'), {
                reply_markup: (0, keyboards_1.ageKeyboard)(ctx.session)
            });
        }
        else {
            ctx.session.question = 'years';
            ctx.logger.info({
                userId,
                profileType: ctx.session.additionalFormInfo.selectedProfileType
            }, 'Using default years question');
            yield ctx.reply(ctx.t('years_question'), {
                reply_markup: (0, keyboards_1.ageKeyboard)(ctx.session)
            });
        }
        ctx.logger.info({
            userId,
            question: ctx.session.question
        }, 'Profile change from start completed');
    });
}
