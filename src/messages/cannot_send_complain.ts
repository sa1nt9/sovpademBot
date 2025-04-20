import { acceptPrivacyKeyboard, ageKeyboard, answerFormKeyboard, createProfileTypeKeyboard } from '../constants/keyboards';
import { prisma } from '../db/postgres';
import { candidatesEnded } from '../functions/candidatesEnded';
import { getCandidate } from '../functions/db/getCandidate';
import { sendForm } from '../functions/sendForm';
import { startSearchingPeople } from '../functions/startSearchingPeople';
import { MyContext } from '../typescript/context';

export async function cannotSendComplainStep(ctx: MyContext) {    
    const userId = String(ctx.message!.from.id)
    
    ctx.logger.info({ userId, step: 'cannot_send_complain' }, 'User unable to send complaint, redirecting');

    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (existingUser) {
        ctx.logger.info({ userId, hasProfile: true }, 'User has profile, redirecting to people search');
        await startSearchingPeople(ctx, { setActive: true })

        const candidate = await getCandidate(ctx)
        ctx.logger.info({ userId, candidateId: candidate?.id }, 'Retrieved next candidate after blocked complaint');

        if (candidate) {    
            await sendForm(ctx, candidate || null, { myForm: false })
        } else {
            ctx.logger.info({ userId }, 'No more candidates available after blocked complaint');
            await candidatesEnded(ctx)
        }
    } else {
        ctx.logger.info({ userId, hasProfile: false }, 'User has no profile, redirecting to profile creation');
        
        if (ctx.session.privacyAccepted) {
            ctx.logger.info({ userId, privacyAccepted: true }, 'Privacy already accepted, proceeding to profile type');
            ctx.session.step = "create_profile_type"
            ctx.session.isCreatingProfile = true;

            await ctx.reply(ctx.t('profile_type_title'), {
                reply_markup: createProfileTypeKeyboard(ctx.t)
            });
        } else {
            ctx.logger.info({ userId, privacyAccepted: false }, 'Privacy not accepted, redirecting to privacy');
            ctx.session.step = "accept_privacy";

            await ctx.reply(ctx.t('privacy_message'), {
                reply_markup: acceptPrivacyKeyboard(ctx.t),
                parse_mode: "Markdown"
            });
        }
    }
} 