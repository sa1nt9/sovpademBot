import { deactivateProfileKeyboard, profileKeyboard } from './../constants/keyboards';
import { formDisabledKeyboard } from '../constants/keyboards';
import { MyContext } from '../typescript/context';
import { checkIsKeyboardOption } from '../functions/checkIsKeyboardOption';
import { getProfileTypeLocalizations, getSubtypeLocalizations, getUserProfiles, toggleProfileActive } from '../functions/db/profilesService';

export async function disableFormStep(ctx: MyContext) {
    const message = ctx.message!.text;

    const profiles = await getUserProfiles(String(ctx.from?.id), ctx);

    if (checkIsKeyboardOption(deactivateProfileKeyboard(ctx.t, profiles), message)) {

        if (message === ctx.t("disable_all_profiles")) {
            ctx.session.step = 'form_disabled'

            profiles.forEach(async (profile) => {
                await toggleProfileActive(String(ctx.from?.id), profile.profileType, false, profile.subType);
            });

            await ctx.reply(ctx.t('form_disabled_message'), {
                reply_markup: formDisabledKeyboard(ctx.t)
            });
        } else if (message === ctx.t('go_back')) {
            ctx.session.step = 'sleep_menu'

            await ctx.reply(ctx.t('sleep_menu'), {
                reply_markup: profileKeyboard()
            });
        } else {
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
                await toggleProfileActive(String(ctx.from?.id), selectedProfile.profileType, false, selectedProfile.subType);
            }

            ctx.session.step = 'form_disabled'

            await ctx.reply(ctx.t('form_disabled_message'), {
                reply_markup: formDisabledKeyboard(ctx.t)
            });
        }

    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: deactivateProfileKeyboard(ctx.t, profiles)
        });
    }
} 