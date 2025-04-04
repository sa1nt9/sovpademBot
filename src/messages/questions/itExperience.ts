import { ageKeyboard, itTechnologiesKeyboard, selectItExperienceKeyboard, selectSportLevelkeyboard } from "../../constants/keyboards";
import { checkIsKeyboardOption } from "../../functions/checkIsKeyboardOption";
import { MyContext } from "../../typescript/context";
import { ITProfile } from "@prisma/client";
import { IITProfile } from "../../typescript/interfaces/IProfile";

export const itExperienceQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;

    if (message && checkIsKeyboardOption(selectItExperienceKeyboard(ctx.t), message)) {
        ctx.session.question = 'it_technologies';
        (ctx.session.activeProfile as IITProfile).experience = message

        await ctx.reply(ctx.t('it_technologies_question'), {
            reply_markup: itTechnologiesKeyboard(ctx.t, ctx.session)
        });
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: selectSportLevelkeyboard(ctx.t)
        });
    }
} 