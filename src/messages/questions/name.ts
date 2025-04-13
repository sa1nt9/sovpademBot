import { nameKeyboard, textKeyboard } from "../../constants/keyboards";
import { MyContext } from "../../typescript/context";

export const nameQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ 
        userId, 
        question: 'name', 
        input: message,
        profileType: ctx.session.activeProfile?.profileType
    }, 'User answering name question');
    
    if (!message) {
        ctx.logger.warn({ userId }, 'User sent empty name');
        await ctx.reply(ctx.t('type_name'), {
            reply_markup: nameKeyboard(ctx.session)
        });
    } else if (message.length > 100) {
        ctx.logger.warn({ userId, nameLength: message.length }, 'User name too long');
        await ctx.reply(ctx.t('long_name'), {
            reply_markup: nameKeyboard(ctx.session)
        });
    } else {
        ctx.logger.info({ userId, name: message }, 'User name validated and saved');
        ctx.session.question = "text";
        if (ctx.session.activeProfile.name) {
            ctx.session.activeProfile.previousName = ctx.session.activeProfile.name
        }
        ctx.session.activeProfile.name = message

        await ctx.reply(ctx.t('text_question', {
            profileType: ctx.session.additionalFormInfo.selectedProfileType
        }), {
            reply_markup: textKeyboard(ctx.t, ctx.session)
        });
    }
} 