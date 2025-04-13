import { allRightKeyboard, answerFormKeyboard, profileKeyboard } from "../../constants/keyboards";
import { MyContext } from "../../typescript/context";
import { getCandidate } from "../../functions/db/getCandidate";
import { sendForm } from "../../functions/sendForm";
import { candidatesEnded } from "../../functions/candidatesEnded";
import { startSearchingPeople } from "../../functions/startSearchingPeople";

export const allRightQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ 
        userId, 
        question: 'all_right',
        input: message,
        profileType: ctx.session.activeProfile?.profileType
    }, 'User at final profile confirmation stage');
    
    if (message === ctx.t("yes")) {
        ctx.logger.info({ userId }, 'User confirmed profile and ready to browse matches');
        await startSearchingPeople(ctx, { setActive: true })

        const candidate = await getCandidate(ctx)
        ctx.logger.info({ userId, candidateId: candidate?.id }, 'First candidate after profile completion');

        if (candidate) {
            await sendForm(ctx, candidate || null, { myForm: false })
        } else {
            ctx.logger.info({ userId }, 'No candidates available after profile completion');
            await candidatesEnded(ctx)
        }

    } else if (message === ctx.t('change_form')) {
        ctx.logger.info({ userId }, 'User wants to change profile before browsing');
        ctx.session.step = 'profile'

        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });

    } else {
        ctx.logger.warn({ userId, invalidOption: message }, 'User provided invalid response at confirmation');
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: allRightKeyboard(ctx.t)
        });
    }
} 