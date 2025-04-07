import { HobbyProfile } from './../../node_modules/.prisma/client/index.d';
import { ProfileType } from "@prisma/client";
import { ageKeyboard, createProfileSubtypeKeyboard, createProfileTypeKeyboard, gameAccountKeyboard, selectItExperienceKeyboard, selectSportLevelkeyboard, youAlreadyHaveThisProfileKeyboard } from "../constants/keyboards";
import { MyContext } from "../typescript/context";
import { SportType, GameType, HobbyType, ITType } from "@prisma/client";
import { gameLocalizationKeys } from "../functions/gameLink";
import { getSubtypeLocalizations, getUserProfile } from '../functions/db/profilesService';
import { youAlreadyHaveThisProfileStep } from './you_already_have_this_profile';
import { changeProfileFromStart } from '../functions/changeProfileFromStart';
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

        await changeProfileFromStart(ctx)
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: createProfileSubtypeKeyboard(ctx.t, ctx.session.activeProfile.profileType)
        });
    }
}