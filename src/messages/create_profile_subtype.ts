import { createProfileSubtypeKeyboard, youAlreadyHaveThisProfileKeyboard } from "../constants/keyboards";
import { MyContext } from "../typescript/context";
import { getSubtypeLocalizations, getUserProfile } from '../functions/db/profilesService';
import { changeProfileFromStart } from '../functions/changeProfileFromStart';


export async function createProfileSubtypeStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const subtypeLocalizations = getSubtypeLocalizations(ctx.t)

    if (message && Object.keys(subtypeLocalizations[ctx.session.additionalFormInfo.selectedProfileType.toLowerCase() as keyof typeof subtypeLocalizations]).includes(message)) {
        const profileType = ctx.session.additionalFormInfo.selectedProfileType;
        const subType = subtypeLocalizations[profileType?.toLowerCase() as keyof typeof subtypeLocalizations][message];
        ctx.session.additionalFormInfo.selectedSubType = subType;

        const existingProfile = await getUserProfile(String(ctx.from?.id), profileType, subType);

        if (existingProfile) {
            ctx.session.step = 'you_already_have_this_profile'

            await ctx.reply(ctx.t('you_already_have_this_profile'), {
                reply_markup: youAlreadyHaveThisProfileKeyboard(ctx.t)
            });
            return;
        }

        await changeProfileFromStart(ctx)
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: createProfileSubtypeKeyboard(ctx.t, ctx.session.additionalFormInfo.selectedProfileType)
        });
    }
}