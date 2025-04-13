import { ageKeyboard, itTechnologiesKeyboard, selectItExperienceKeyboard, selectSportLevelkeyboard } from "../../constants/keyboards";
import { checkIsKeyboardOption } from "../../functions/checkIsKeyboardOption";
import { MyContext } from "../../typescript/context";
import { ItProfile } from "@prisma/client";
import { IItProfile } from "../../typescript/interfaces/IProfile";

export const itExperienceQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ 
        userId, 
        question: 'it_experience',
        input: message,
        profileType: ctx.session.activeProfile?.profileType
    }, 'User answering IT experience question');

    if (message && checkIsKeyboardOption(selectItExperienceKeyboard(ctx.t), message)) {
        ctx.logger.info({ userId, itExperience: message }, 'User IT experience validated and saved');
        ctx.session.question = 'it_technologies';
        (ctx.session.activeProfile as IItProfile).experience = message

        await ctx.reply(ctx.t('it_technologies_question'), {
            reply_markup: itTechnologiesKeyboard(ctx.t, ctx.session)
        });
    } else {
        ctx.logger.warn({ userId, invalidOption: message }, 'User provided invalid IT experience option');
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: selectSportLevelkeyboard(ctx.t)
        });
    }
} 