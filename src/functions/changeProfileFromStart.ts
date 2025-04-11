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
    ctx.session.isEditingProfile = true;
    if (ctx.session.activeProfile.profileType === ProfileType.SPORT) {
        ctx.session.activeProfile.subType = subtypeLocalizations.sport[message as keyof typeof subtypeLocalizations.sport] as SportType;
        ctx.session.question = 'sport_level'

        await ctx.reply(ctx.t('sport_level_question'), {
            reply_markup: selectSportLevelkeyboard(ctx.t)
        });
    } else if (ctx.session.activeProfile.profileType === ProfileType.IT) {
        ctx.session.activeProfile.subType = subtypeLocalizations.it[message] as ITType;
        ctx.session.question = 'it_experience'

        await ctx.reply(ctx.t('it_experience_question'), {
            reply_markup: selectItExperienceKeyboard(ctx.t)
        });
    } else if (ctx.session.activeProfile.profileType === ProfileType.GAME) {
        ctx.session.activeProfile.subType = subtypeLocalizations.game[message] as GameType;
        ctx.session.question = 'game_account'

        await ctx.reply(ctx.t(gameLocalizationKeys[ctx.session.activeProfile.subType]), {
            reply_markup: gameAccountKeyboard(ctx.t, ctx.session)
        });
    } else if (ctx.session.activeProfile.profileType === ProfileType.HOBBY) {
        ctx.session.activeProfile.subType = subtypeLocalizations.hobby[message] as HobbyType;
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
