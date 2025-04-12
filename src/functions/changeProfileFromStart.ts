import { HobbyType, ITType } from "@prisma/client";
import { ageKeyboard } from "../constants/keyboards";
import { gameAccountKeyboard } from "../constants/keyboards";
import { GameType } from "@prisma/client";
import { selectItExperienceKeyboard } from "../constants/keyboards";
import { SportType } from "@prisma/client";
import { ProfileType } from "@prisma/client";
import { MyContext } from "../typescript/context";
import { getSubtypeLocalizations } from "./db/profilesService";
import { selectSportLevelkeyboard } from "../constants/keyboards";
import { gameLocalizationKeys } from "./gameLink";

export async function changeProfileFromStart(ctx: MyContext) {
    const message = ctx.message!.text!;
    const subtypeLocalizations = getSubtypeLocalizations(ctx.t)


    ctx.session.step = "questions";
    if (ctx.session.additionalFormInfo.selectedProfileType === ProfileType.SPORT) {
        if (!ctx.session.isEditingProfile) {
            ctx.session.additionalFormInfo.selectedSubType = subtypeLocalizations.sport[message] as SportType;
        }
        ctx.session.question = 'sport_level'

        await ctx.reply(ctx.t('sport_level_question'), {
            reply_markup: selectSportLevelkeyboard(ctx.t)
        });
    } else if (ctx.session.additionalFormInfo.selectedProfileType === ProfileType.IT) {
        if (!ctx.session.isEditingProfile) {
            ctx.session.additionalFormInfo.selectedSubType = subtypeLocalizations.it[message] as ITType;
        }
        ctx.session.question = 'it_experience'

        await ctx.reply(ctx.t('it_experience_question'), {
            reply_markup: selectItExperienceKeyboard(ctx.t)
        });
    } else if (ctx.session.additionalFormInfo.selectedProfileType === ProfileType.GAME) {
        if (!ctx.session.isEditingProfile) {
            ctx.session.additionalFormInfo.selectedSubType = subtypeLocalizations.game[message] as GameType;
        }
        ctx.session.question = 'game_account'

        if (ctx.session.additionalFormInfo.selectedSubType) {
            await ctx.reply(ctx.t(gameLocalizationKeys[ctx.session.additionalFormInfo.selectedSubType as GameType]), {
                reply_markup: gameAccountKeyboard(ctx.t, ctx.session)
            });
        }
    } else if (ctx.session.additionalFormInfo.selectedProfileType === ProfileType.HOBBY) {
        ctx.session.additionalFormInfo.selectedSubType = subtypeLocalizations.hobby[message] as HobbyType;
        ctx.session.question = 'years'

        await ctx.reply(ctx.t('years_question'), {
            reply_markup: ageKeyboard(ctx.session)
        });
    } else {
        ctx.session.question = 'years'

        await ctx.reply(ctx.t('years_question'), {
            reply_markup: ageKeyboard(ctx.session)
        });
    }
}
