import { genderKeyboard } from "../../constants/keyboards";
import { ageKeyboard } from "../../constants/keyboards";
import { MyContext } from "../../typescript/context";

export const yearsQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ 
        userId, 
        question: 'years', 
        input: message,
        profileType: ctx.session.activeProfile?.profileType
    }, 'User answering age question');
    
    const n = Number(message)
    if (!/^\d+$/.test(message || "str")) {
        ctx.logger.warn({ userId, invalidInput: message }, 'User provided non-numeric age');
        await ctx.reply(ctx.t('type_years'), {
            reply_markup: ageKeyboard(ctx.session)
        });
    } else if (n <= 8) {
        ctx.logger.warn({ userId, age: n }, 'User provided age too low');
        await ctx.reply(ctx.t('type_bigger_year'), {
            reply_markup: ageKeyboard(ctx.session)
        });
    } else if (n > 100) {
        ctx.logger.warn({ userId, age: n }, 'User provided age too high');
        await ctx.reply(ctx.t('type_smaller_year'), {
            reply_markup: ageKeyboard(ctx.session)
        });
    } else {
        ctx.logger.info({ userId, age: n }, 'User age validated and saved');
        ctx.session.activeProfile.age = n;
        ctx.session.question = "gender";

        await ctx.reply(ctx.t('gender_question'), {
            reply_markup: genderKeyboard(ctx.t)
        });
    }
}
