import { ProfileType } from "@prisma/client";
import { ageKeyboard, createProfileSubtypeKeyboard, createProfileTypeKeyboard, youAlreadyHaveThisProfileKeyboard } from "../constants/keyboards";
import { MyContext } from "../typescript/context";
import { getProfileTypeLocalizations, getUserProfile } from "../functions/db/profilesService";
import { startChangeGeneralUserData } from "../functions/startChangeGeneralUserData";

export async function createProfileTypeStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ userId, step: 'create_profile_type', message }, 'User selecting profile type');

    if (message && message in getProfileTypeLocalizations(ctx.t)) {
        const profileType = getProfileTypeLocalizations(ctx.t)[message]
        ctx.logger.info({ userId, profileType }, 'Profile type selected');
        
        if (profileType === ProfileType.RELATIONSHIP) {
            const existingProfile = await getUserProfile(String(ctx.from?.id), ProfileType.RELATIONSHIP);
            
            if (existingProfile) {
                ctx.logger.info({ userId, profileType }, 'User already has relationship profile');
                ctx.session.step = 'you_already_have_this_profile'
                ctx.session.additionalFormInfo.selectedProfileType = profileType;

                await ctx.reply(ctx.t('you_already_have_this_profile'), {
                    reply_markup: youAlreadyHaveThisProfileKeyboard(ctx.t)
                });
                
                return
            }
        }
        
        ctx.session.additionalFormInfo.selectedProfileType = profileType;
        ctx.session.step = 'create_profile_subtype'

        
        if (profileType === ProfileType.RELATIONSHIP) {
            ctx.logger.info({ userId, profileType }, 'Relationship profile - proceeding to age question');
            ctx.session.step = "questions";
            
            await startChangeGeneralUserData(ctx);
        } else {
            ctx.logger.info({ userId, profileType }, 'Non-relationship profile - proceeding to subtype selection');
            const text = ctx.t(`${profileType.toLowerCase()}_type_title`)
            
            await ctx.reply(text, {
                reply_markup: createProfileSubtypeKeyboard(ctx.t, profileType)
            });
        }
    } else {
        ctx.logger.warn({ userId, invalidOption: message }, 'User selected invalid profile type');
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: createProfileTypeKeyboard(ctx.t)
        });
    }
}