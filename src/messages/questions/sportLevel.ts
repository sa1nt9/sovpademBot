import { ageKeyboard, nameKeyboard, selectSportLevelkeyboard } from "../../constants/keyboards";
import { checkIsKeyboardOption } from "../../functions/checkIsKeyboardOption";
import { MyContext } from "../../typescript/context";
import { ISportProfile } from "../../typescript/interfaces/IProfile";

export const sportLevelQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ 
        userId, 
        question: 'sport_level',
        input: message,
        profileType: ctx.session.activeProfile?.profileType
    }, 'User answering sport level question');

    if (checkIsKeyboardOption(selectSportLevelkeyboard(ctx.t), message)) {
        ctx.logger.info({ userId, sportLevel: message }, 'User sport level validated and saved');
        ctx.session.question = 'years';
        (ctx.session.activeProfile as ISportProfile).level = message

        await ctx.reply(ctx.t('years_question'), {
            reply_markup: ageKeyboard(ctx.session)
        });
    } else {
        ctx.logger.warn({ userId, invalidOption: message }, 'User provided invalid sport level');
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: selectSportLevelkeyboard(ctx.t)
        });
    }
} 