import { complainKeyboard, goBackKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { MyContext } from "../typescript/context";

export const complainCommand = async (ctx: MyContext) => {
    const userId = String(ctx.from?.id);

    ctx.logger.info({ 
        userId,
        currentStep: ctx.session.step,
        hasCandidateProfile: !!ctx.session.currentCandidateProfile
    }, 'Starting complain command');

    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });
    
    if (existingUser && ctx.session.currentCandidateProfile && (ctx.session.step === "search_people" || ctx.session.step === "search_people_with_likes" || ctx.session.step === "options_to_user")) {
        ctx.session.step = "complain";
        ctx.logger.info({ userId }, 'Showing complain options');

        await ctx.reply(ctx.t('complain_text'), {
            reply_markup: complainKeyboard()
        });
    } else {
        ctx.session.step = "cannot_send_complain";
        ctx.logger.warn({ userId }, 'Cannot send complain - wrong context');

        await ctx.reply(ctx.t('complain_can_be_sended_only_while_searching'), {
            reply_markup: goBackKeyboard(ctx.t, true)
        });
    }
}