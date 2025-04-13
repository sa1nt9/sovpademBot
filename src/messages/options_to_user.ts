import { getCandidate } from "../functions/db/getCandidate";
import { candidatesEnded } from "../functions/candidatesEnded";
import { MyContext } from "../typescript/context";
import { sendForm } from "../functions/sendForm";
import { answerFormKeyboard, complainKeyboard, optionsToUserKeyboard, profileKeyboard } from "../constants/keyboards";
import { sendMutualSympathyAfterAnswer } from "../functions/sendMutualSympathyAfterAnswer";
import { prisma } from "../db/postgres";
import { addToBlacklist } from "../functions/addToBlacklist";
import { startSearchingPeople } from "../functions/startSearchingPeople";

export async function optionsToUserStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    const candidateId = ctx.session.currentCandidateProfile?.id;
    
    ctx.logger.info({ userId, step: 'options_to_user', action: message }, 'User selecting options for profile');
    
    if (message === '1. 🚫') {
        ctx.logger.info({ userId, candidateId }, 'User adding profile to blacklist');
        await addToBlacklist(ctx)
    } else if (message === '2. ⚠️') {
        ctx.logger.info({ userId, candidateId }, 'User reporting profile');
        ctx.session.step = "complain";

        await ctx.reply(ctx.t('complain_text'), {
            reply_markup: complainKeyboard()
        })
    } else if (message === '3. 💤') {
        ctx.logger.info({ userId }, 'User returning to sleep menu');
        ctx.session.step = 'sleep_menu'
        await ctx.reply(ctx.t('wait_somebody_to_see_your_form'))

        if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
            ctx.logger.info({ 
                userId, 
                pendingMutualLikeProfileId: ctx.session.pendingMutualLikeProfileId 
            }, 'Processing pending mutual like before sleep menu');
            
            await sendMutualSympathyAfterAnswer(ctx)
            return
        }

        await ctx.reply(ctx.t('sleep_menu'), {
            reply_markup: profileKeyboard()
        })
    } else if (message === ctx.t("go_back")) {
        ctx.logger.info({ userId }, 'User returning to profile browsing');
        await startSearchingPeople(ctx)

        const candidate = await getCandidate(ctx)
        ctx.logger.info({ userId, candidateId: candidate?.id }, 'Retrieved next candidate after returning');
        
        if (candidate) {
            await sendForm(ctx, candidate || null, { myForm: false })
        } else {
            ctx.logger.info({ userId }, 'No more candidates available');
            await candidatesEnded(ctx)
        }
    } else {
        ctx.logger.warn({ userId, invalidOption: message }, 'User provided invalid option');
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: optionsToUserKeyboard(ctx.t)
        });
    }
}