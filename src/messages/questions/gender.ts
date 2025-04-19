import { genderKeyboard, interestedInKeyboard } from "../../constants/keyboards";
import { MyContext } from "../../typescript/context";

export const genderQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ 
        userId, 
        question: 'gender', 
        input: message,
        profileType: ctx.session.activeProfile?.profileType
    }, 'User answering gender question');
    
    if (genderKeyboard(ctx.t)?.keyboard[0].includes(message || "")) {
        const gender = message === ctx.t('i_man') ? 'male' : 'female';
        ctx.logger.info({ userId, gender }, 'User gender selection validated and saved');
        
        ctx.session.activeProfile.gender = gender;
        ctx.session.question = "interested_in";

        await ctx.reply(ctx.t('interested_in_question'), {
            reply_markup: interestedInKeyboard(ctx.t)
        });
    } else {
        ctx.logger.warn({ userId, invalidInput: message }, 'User provided invalid gender option');
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: genderKeyboard(ctx.t)
        });
    }
} 