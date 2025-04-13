import { ProfileType, SportType } from "@prisma/client";
import { createProfileTypeKeyboard, profileKeyboard, youAlreadyHaveThisProfileKeyboard } from "../constants/keyboards";
import { getUserProfile } from "../functions/db/profilesService";
import { sendForm } from "../functions/sendForm";
import { MyContext } from "../typescript/context";

export const youAlreadyHaveThisProfileStep = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    const userId = String(ctx.from?.id);
    
    ctx.logger.info({ 
        userId, 
        step: 'you_already_have_this_profile', 
        profileType: ctx.session.additionalFormInfo.selectedProfileType,
        subType: ctx.session.additionalFormInfo.selectedSubType 
    }, 'User has profile conflict');

    if (message === ctx.t('switch_to_this_profile')) {
        ctx.logger.info({ 
            userId, 
            profileType: ctx.session.additionalFormInfo.selectedProfileType,
            subType: ctx.session.additionalFormInfo.selectedSubType 
        }, 'User switching to existing profile');
        
        const fullProfile = await getUserProfile(
            String(ctx.from?.id),
            ctx.session.additionalFormInfo.selectedProfileType || ProfileType.SPORT,
            ctx.session.additionalFormInfo.selectedSubType
        );

        if (fullProfile) {
            ctx.session.activeProfile = { ...ctx.session.activeProfile, ...fullProfile };
            ctx.session.step = "profile";

            await sendForm(ctx);

            await ctx.reply(ctx.t('profile_menu'), {
                reply_markup: profileKeyboard()
            });
        }
    } else if (message === ctx.t('create_new_profile')) {
        ctx.logger.info({ userId }, 'User selecting to create a different profile type');
        ctx.session.step = "create_profile_type"
        ctx.session.isCreatingProfile = true;

        await ctx.reply(ctx.t('profile_type_title'), {
            reply_markup: createProfileTypeKeyboard(ctx.t)
        });
    } else if (message === ctx.t('main_menu')) {
        ctx.logger.info({ userId }, 'User returning to main menu from profile conflict');
        ctx.session.step = "profile";

        await sendForm(ctx)

        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else {
        ctx.logger.warn({ userId, invalidOption: message }, 'User provided invalid response in profile conflict screen');
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: youAlreadyHaveThisProfileKeyboard(ctx.t)
        });
    }
}
