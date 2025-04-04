import { ageKeyboard, nameKeyboard, selectSportLevelkeyboard } from "../../constants/keyboards";
import { checkIsKeyboardOption } from "../../functions/checkIsKeyboardOption";
import { MyContext } from "../../typescript/context";
import { ISportProfile } from "../../typescript/interfaces/IProfile";

export const sportLevelQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;

    if (checkIsKeyboardOption(selectSportLevelkeyboard(ctx.t), message)) {
        ctx.session.question = 'years';
        (ctx.session.activeProfile as ISportProfile).level = message

        await ctx.reply(ctx.t('years_question'), {
            reply_markup: ageKeyboard(ctx.session)
        });
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: selectSportLevelkeyboard(ctx.t)
        });
    }
} 