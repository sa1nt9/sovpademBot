import { HobbyType, ITType } from "@prisma/client";
import { ageKeyboard, keepUserInfoKeyboard } from "../constants/keyboards";
import { gameAccountKeyboard } from "../constants/keyboards";
import { GameType } from "@prisma/client";
import { selectItExperienceKeyboard } from "../constants/keyboards";
import { SportType } from "@prisma/client";
import { ProfileType } from "@prisma/client";
import { MyContext } from "../typescript/context";
import { getSubtypeLocalizations, getUserProfiles } from "./db/profilesService";
import { selectSportLevelkeyboard } from "../constants/keyboards";
import { gameLocalizationKeys } from "./gameLink";
import { startChangeGeneralUserData } from "./startChangeGeneralUserData";

export async function changeProfileFromStart(ctx: MyContext) {
    const userId = String(ctx.from?.id);
    const message = ctx.message!.text!;
    const subtypeLocalizations = getSubtypeLocalizations(ctx.t)

    ctx.logger.info({
        userId,
        message,
        profileType: ctx.session.additionalFormInfo.selectedProfileType,
        isEditing: ctx.session.isEditingProfile
    }, 'Starting profile change from start');

    ctx.session.step = "questions";
    if (ctx.session.additionalFormInfo.selectedProfileType === ProfileType.SPORT) {
        if (!ctx.session.isEditingProfile) {
            ctx.session.additionalFormInfo.selectedSubType = subtypeLocalizations.sport[message] as SportType;
            ctx.logger.info({
                userId,
                subType: ctx.session.additionalFormInfo.selectedSubType
            }, 'Selected sport subtype');
        }
        ctx.session.question = 'sport_level'

        await ctx.reply(ctx.t('sport_level_question'), {
            reply_markup: selectSportLevelkeyboard(ctx.t)
        });
    } else if (ctx.session.additionalFormInfo.selectedProfileType === ProfileType.IT) {
        if (!ctx.session.isEditingProfile) {
            ctx.session.additionalFormInfo.selectedSubType = subtypeLocalizations.it[message] as ITType;
            ctx.logger.info({
                userId,
                subType: ctx.session.additionalFormInfo.selectedSubType
            }, 'Selected IT subtype');
        }
        ctx.session.question = 'it_experience'

        await ctx.reply(ctx.t('it_experience_question'), {
            reply_markup: selectItExperienceKeyboard(ctx.t)
        });
    } else if (ctx.session.additionalFormInfo.selectedProfileType === ProfileType.GAME) {
        if (!ctx.session.isEditingProfile) {
            ctx.session.additionalFormInfo.selectedSubType = subtypeLocalizations.game[message] as GameType;
            ctx.logger.info({
                userId,
                subType: ctx.session.additionalFormInfo.selectedSubType
            }, 'Selected game subtype');
        }
        ctx.session.question = 'game_account'

        if (ctx.session.additionalFormInfo.selectedSubType) {
            await ctx.reply(ctx.t(gameLocalizationKeys[ctx.session.additionalFormInfo.selectedSubType as GameType]), {
                reply_markup: gameAccountKeyboard(ctx.t, ctx.session)
            });
        }
    } else if (ctx.session.additionalFormInfo.selectedProfileType === ProfileType.HOBBY) {
        ctx.session.additionalFormInfo.selectedSubType = subtypeLocalizations.hobby[message] as HobbyType;
        ctx.logger.info({
            userId,
            subType: ctx.session.additionalFormInfo.selectedSubType
        }, 'Selected hobby subtype');

        await startChangeGeneralUserData(ctx);
    } else {
        ctx.logger.info({
            userId,
            profileType: ctx.session.additionalFormInfo.selectedProfileType
        }, 'Using default years question');

        await startChangeGeneralUserData(ctx);

    }

    ctx.logger.info({
        userId,
        question: ctx.session.question
    }, 'Profile change from start completed');
}
