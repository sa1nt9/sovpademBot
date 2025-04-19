import { ageKeyboard, interestedInKeyboard, keepUserInfoKeyboard } from "../../constants/keyboards";
import { MyContext } from "../../typescript/context";

export const keepUserInfoQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ 
        userId, 
        question: 'keep_user_info', 
        input: message,
        profileType: ctx.session.activeProfile?.profileType
    }, 'User answering keep user info question');
    
    if (message === ctx.t('some_data_are_general_1')) {
        ctx.session.question = 'years'
        ctx.logger.info({ 
            userId,
            profileType: ctx.session.additionalFormInfo.selectedProfileType
        }, 'Using default years question');

        await ctx.reply(ctx.t('years_question'), {
            reply_markup: ageKeyboard(ctx.session)
        });
        
    } else if (message === ctx.t('some_data_are_general_2')) {
        ctx.logger.info({ userId }, 'User chose to fill in the data again');
        ctx.session.question = "interested_in";
        ctx.session.additionalFormInfo.keepUserInfo = true;

        await ctx.reply(ctx.t('interested_in_question'), {
            reply_markup: interestedInKeyboard(ctx.t)
        });
        
    } else {
        ctx.logger.warn({ userId, invalidInput: message }, 'User provided invalid gender option');
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: keepUserInfoKeyboard(ctx.t)
        });
    }
} 