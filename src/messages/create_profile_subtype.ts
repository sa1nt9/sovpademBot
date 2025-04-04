import { HobbyProfile } from './../../node_modules/.prisma/client/index.d';
import { ProfileType } from "@prisma/client";
import { ageKeyboard, createProfileSubtypeKeyboard, createProfileTypeKeyboard, gameAccountKeyboard, selectItExperienceKeyboard, selectSportLevelkeyboard, youAlreadyHaveThisProfileKeyboard } from "../constants/keyboards";
import { MyContext } from "../typescript/context";
import { SportType, GameType, HobbyType, ITType } from "@prisma/client";
import { gameLocalizationKeys } from "../functions/gameLink";
import { getSubtypeLocalizations, getUserProfile } from '../functions/db/profilesService';
import { youAlreadyHaveThisProfileStep } from './you_already_have_this_profile';

export async function createProfileSubtypeStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const subtypeLocalizations = getSubtypeLocalizations(ctx.t)

    if (message && Object.keys(subtypeLocalizations[ctx.session.activeProfile.profileType.toLowerCase() as keyof typeof subtypeLocalizations]).includes(message)) {
        const profileType = ctx.session.activeProfile.profileType;
        const subType = subtypeLocalizations[profileType.toLowerCase() as keyof typeof subtypeLocalizations][message];

        const existingProfile = await getUserProfile(String(ctx.from?.id), profileType, subType);

        if (existingProfile) {
            ctx.session.step = 'you_already_have_this_profile'
            ctx.session.additionalFormInfo.selectedProfileType = profileType;
            ctx.session.additionalFormInfo.selectedSubType = subType;

            await ctx.reply(ctx.t('you_already_have_this_profile'), {
                reply_markup: youAlreadyHaveThisProfileKeyboard(ctx.t)
            });
            return;
        }

        ctx.session.step = "questions";
        if (ctx.session.activeProfile.profileType === ProfileType.SPORT) {
            ctx.session.activeProfile.subType = subtypeLocalizations.sport[message] as SportType;
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

    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: createProfileSubtypeKeyboard(ctx.t, ctx.session.activeProfile.profileType)
        });
    }
}