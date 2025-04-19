import { ageKeyboard } from "../constants/keyboards";
import { keepUserInfoKeyboard } from "../constants/keyboards";
import { MyContext } from "../typescript/context";
import { getUserProfiles } from "./db/profilesService";

export const startChangeGeneralUserData = async (ctx: MyContext) => {
    const userId = String(ctx.from!.id);

    const profiles = await getUserProfiles(userId, ctx);
    if (profiles.length > 0) {
        ctx.session.question = 'keep_user_info'

        await ctx.reply(ctx.t('some_data_are_general'), {
            reply_markup: keepUserInfoKeyboard(ctx.t)
        });
    } else {
        ctx.session.question = 'years'

        await ctx.reply(ctx.t('years_question'), {
            reply_markup: ageKeyboard(ctx.session)
        });
    }   
}