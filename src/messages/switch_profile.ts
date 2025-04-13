import { createProfileTypeKeyboard, switchProfileKeyboard } from "../constants/keyboards";
import { checkIsKeyboardOption } from "../functions/checkIsKeyboardOption";
import { getUserProfiles, getUserProfile, getProfileTypeLocalizations, getSubtypeLocalizations } from "../functions/db/profilesService";
import { MyContext } from "../typescript/context";
import { sendForm } from "../functions/sendForm";
import { profileKeyboard } from "../constants/keyboards";

export const switchProfileStep = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    const userId = String(ctx.from?.id);
    
    ctx.logger.info({ userId }, 'User in profile switch menu');

    if (message === ctx.t('go_back')) {
        ctx.logger.info({ userId }, 'User returning to main menu');
        ctx.session.step = 'sleep_menu'

        await ctx.reply(ctx.t('sleep_menu'), {
            reply_markup: profileKeyboard()
        });
    } else if (message === ctx.t('create_new_profile')) {
        ctx.logger.info({ userId }, 'User creating new profile');
        ctx.session.step = "create_profile_type"
        ctx.session.isCreatingProfile = true;

        await ctx.reply(ctx.t('profile_type_title'), {
            reply_markup: createProfileTypeKeyboard(ctx.t)
        });
    } else {
        const profiles = await getUserProfiles(userId, ctx);

        if (checkIsKeyboardOption(switchProfileKeyboard(ctx.t, profiles), message)) {
            const selectedProfile = profiles.find(profile => {
                const profileTypeLocalizations = getProfileTypeLocalizations(ctx.t);
                const subtypeLocalizations = getSubtypeLocalizations(ctx.t);

                const profileTypeKey = Object.keys(profileTypeLocalizations).find(
                    key => profileTypeLocalizations[key] === profile.profileType
                );

                let profileSubtypeKey = '';
                if (profile.subType) {
                    profileSubtypeKey = Object.keys(subtypeLocalizations[profile.profileType.toLowerCase() as keyof typeof subtypeLocalizations]).find(
                        key => subtypeLocalizations[profile.profileType.toLowerCase() as keyof typeof subtypeLocalizations][key] === profile.subType
                    ) || '';
                }

                const profileString = `${profileTypeKey}${profile.subType ? `: ${profileSubtypeKey}` : ''}`;
                return profileString === message;
            });

            if (selectedProfile) {
                ctx.logger.info({ 
                    userId, 
                    profileType: selectedProfile.profileType, 
                    subType: selectedProfile.subType 
                }, 'User switched profile');
                
                const fullProfile = await getUserProfile(
                    userId,
                    selectedProfile.profileType,
                    selectedProfile.subType
                );

                if (fullProfile) {
                    ctx.session.activeProfile = { ...ctx.session.activeProfile, ...fullProfile };
                    ctx.session.step = "profile";

                    await sendForm(ctx);

                    await ctx.reply(ctx.t('profile_menu'), {
                        reply_markup: profileKeyboard()
                    });
                }
            }
        } else {
            ctx.logger.warn({ userId, message }, 'Invalid profile selection');
            await ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: switchProfileKeyboard(ctx.t, profiles)
            });
        }
    }
}
