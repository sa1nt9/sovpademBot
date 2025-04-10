import { answerFormKeyboard } from "../constants/keyboards";
import { getCandidate } from "./db/getCandidate";
import { MyContext } from "../typescript/context";
import { prisma } from "../db/postgres";
import { sendMutualSympathyAfterAnswer } from "./sendMutualSympathyAfterAnswer";
import { sendForm } from "./sendForm";
import { candidatesEnded } from "./candidatesEnded";
import { startSearchingPeople } from "./startSearchingPeople";

export const addToBlacklist = async (ctx: MyContext) => {
    if (ctx.session.currentCandidateProfile) {
        // Проверяем, не добавлен ли уже пользователь в черный список
        const existingBlacklist = await prisma.blacklist.findFirst({
            where: {
                userId: String(ctx.from?.id),
                targetProfileId: ctx.session.currentCandidateProfile.id,
                targetUserId: ctx.session.currentCandidateProfile.userId
            }
        });

        if (existingBlacklist) {
            await ctx.reply(ctx.t('more_options_blacklist_already'));
            return;
        }

        // Добавляем пользователя в черный список
        await prisma.blacklist.create({
            data: {
                userId: String(ctx.from?.id),
                targetProfileId: ctx.session.currentCandidateProfile.id,
                profileType: ctx.session.currentCandidateProfile.profileType,
                targetUserId: ctx.session.currentCandidateProfile.userId
            }
        });

        await ctx.reply(ctx.t('more_options_blacklist_success'));
        
        if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
            await sendMutualSympathyAfterAnswer(ctx)
            return
        }
        
        await startSearchingPeople(ctx)

        const candidate = await getCandidate(ctx);
        ctx.logger.info(candidate, 'This is new candidate');
        if (candidate) {
            await sendForm(ctx, candidate || null, { myForm: false });
        } else {
            await candidatesEnded(ctx);
        }
    }
    
}
