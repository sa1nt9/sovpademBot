import { createProfileTypeKeyboard, switchProfileKeyboard } from "../constants/keyboards";
import { checkIsKeyboardOption } from "../functions/checkIsKeyboardOption";
import { getUserProfiles, getUserProfile, getProfileTypeLocalizations, getSubtypeLocalizations } from "../functions/db/profilesService";
import { MyContext } from "../typescript/context";
import { sendForm } from "../functions/sendForm";
import { profileKeyboard } from "../constants/keyboards";

export const switchProfileStep = async (ctx: MyContext) => {
    const message = ctx.message!.text;

    if (message === ctx.t('create_new_profile')) {
        ctx.session.step = "create_profile_type"

        await ctx.reply(ctx.t('profile_type_title'), {
            reply_markup: createProfileTypeKeyboard(ctx.t)
        });
    } else {
        const profiles = await getUserProfiles(String(ctx.from?.id), ctx);

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
                const fullProfile = await getUserProfile(
                    String(ctx.from?.id),
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
            await ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: switchProfileKeyboard(ctx.t, profiles)
            });
        }
    }
}
