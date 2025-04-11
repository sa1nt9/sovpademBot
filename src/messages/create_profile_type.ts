import { ProfileType } from "@prisma/client";
import { ageKeyboard, createProfileSubtypeKeyboard, createProfileTypeKeyboard, youAlreadyHaveThisProfileKeyboard } from "../constants/keyboards";
import { MyContext } from "../typescript/context";
import { getProfileTypeLocalizations, getUserProfile } from "../functions/db/profilesService";

export async function createProfileTypeStep(ctx: MyContext) {
    const message = ctx.message!.text;

    if (message && message in getProfileTypeLocalizations(ctx.t)) {
        const profileType = getProfileTypeLocalizations(ctx.t)[message]
        
        if (profileType === ProfileType.RELATIONSHIP) {
            const existingProfile = await getUserProfile(String(ctx.from?.id), ProfileType.RELATIONSHIP);
            
            if (existingProfile) {
                ctx.session.step = 'you_already_have_this_profile'
                ctx.session.additionalFormInfo.selectedProfileType = profileType;

                await ctx.reply(ctx.t('you_already_have_this_profile'), {
                    reply_markup: youAlreadyHaveThisProfileKeyboard(ctx.t)
                });
                
                return
            }
        }
        
        ctx.session.activeProfile.profileType = profileType
        ctx.session.step = 'create_profile_subtype'

        const text = ctx.t(`${profileType.toLowerCase()}_type_title`)

        if (profileType === ProfileType.RELATIONSHIP) {
            ctx.session.step = "questions";
            ctx.session.isEditingProfile = true;
            ctx.session.question = 'years'

            await ctx.reply(ctx.t('years_question'), {
                reply_markup: ageKeyboard(ctx.session)
            });
        } else {
            await ctx.reply(text, {
                reply_markup: createProfileSubtypeKeyboard(ctx.t, profileType)
            });
        }
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: createProfileTypeKeyboard(ctx.t)
        });
    }
}