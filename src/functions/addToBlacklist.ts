import { answerFormKeyboard } from "../constants/keyboards";
import { getCandidate } from "./db/getCandidate";
import { MyContext } from "../typescript/context";
import { prisma } from "../db/postgres";
import { sendMutualSympathyAfterAnswer } from "./sendMutualSympathyAfterAnswer";
import { sendForm } from "./sendForm";
import { candidatesEnded } from "./candidatesEnded";
import { startSearchingPeople } from "./startSearchingPeople";

export const addToBlacklist = async (ctx: MyContext) => {
    const userId = String(ctx.from?.id);
    
    if (ctx.session.currentCandidateProfile) {
        ctx.logger.info({ 
            userId,
            targetProfileId: ctx.session.currentCandidateProfile.id,
            targetUserId: ctx.session.currentCandidateProfile.userId
        }, 'Adding profile to blacklist');

        // Проверяем, не добавлен ли уже пользователь в черный список
        const existingBlacklist = await prisma.blacklist.findFirst({
            where: {
                userId: userId,
                targetProfileId: ctx.session.currentCandidateProfile.id,
                targetUserId: ctx.session.currentCandidateProfile.userId
            }
        });

        if (existingBlacklist) {
            ctx.logger.info({ userId, targetProfileId: ctx.session.currentCandidateProfile.id }, 'Profile already in blacklist');
            await ctx.reply(ctx.t('more_options_blacklist_already'));
            return;
        }

        // Добавляем пользователя в черный список
        await prisma.blacklist.create({
            data: {
                userId: userId,
                targetProfileId: ctx.session.currentCandidateProfile.id,
                profileType: ctx.session.currentCandidateProfile.profileType,
                targetUserId: ctx.session.currentCandidateProfile.userId
            }
        });

        ctx.logger.info({ userId, targetProfileId: ctx.session.currentCandidateProfile.id }, 'Profile added to blacklist');
        await ctx.reply(ctx.t('more_options_blacklist_success'));
        
        if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
            await sendMutualSympathyAfterAnswer(ctx)
            return
        }
        
        await startSearchingPeople(ctx)

        const candidate = await getCandidate(ctx);
        if (candidate) {
            await sendForm(ctx, candidate || null, { myForm: false });
        } else {
            await candidatesEnded(ctx);
        }
    } else {
        ctx.logger.warn({ userId }, 'No current candidate profile for blacklist');
    }
}
