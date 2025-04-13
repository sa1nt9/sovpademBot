import { createProfileSubtypeKeyboard, youAlreadyHaveThisProfileKeyboard } from "../constants/keyboards";
import { MyContext } from "../typescript/context";
import { getSubtypeLocalizations, getUserProfile } from '../functions/db/profilesService';
import { changeProfileFromStart } from '../functions/changeProfileFromStart';


export async function createProfileSubtypeStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    const subtypeLocalizations = getSubtypeLocalizations(ctx.t)
    
    ctx.logger.info({ 
        userId, 
        step: 'create_profile_subtype', 
        profileType: ctx.session.additionalFormInfo.selectedProfileType,
        message 
    }, 'User selecting profile subtype');

    if (message && Object.keys(subtypeLocalizations[ctx.session.additionalFormInfo.selectedProfileType.toLowerCase() as keyof typeof subtypeLocalizations]).includes(message)) {
        const profileType = ctx.session.additionalFormInfo.selectedProfileType;
        const subType = subtypeLocalizations[profileType?.toLowerCase() as keyof typeof subtypeLocalizations][message];
        ctx.session.additionalFormInfo.selectedSubType = subType;
        
        ctx.logger.info({ userId, profileType, subType }, 'Profile subtype selected');

        const existingProfile = await getUserProfile(String(ctx.from?.id), profileType, subType);

        if (existingProfile) {
            ctx.logger.info({ userId, profileType, subType }, 'User already has this profile type/subtype');
            ctx.session.step = 'you_already_have_this_profile'

            await ctx.reply(ctx.t('you_already_have_this_profile'), {
                reply_markup: youAlreadyHaveThisProfileKeyboard(ctx.t)
            });
            return;
        }

        ctx.logger.info({ userId, profileType, subType }, 'Starting profile creation process');
        await changeProfileFromStart(ctx)
    } else {
        ctx.logger.warn({ 
            userId, 
            invalidOption: message, 
            profileType: ctx.session.additionalFormInfo.selectedProfileType 
        }, 'User selected invalid profile subtype');
        
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: createProfileSubtypeKeyboard(ctx.t, ctx.session.additionalFormInfo.selectedProfileType)
        });
    }
}