import { acceptPrivacyKeyboard, ageKeyboard, answerFormKeyboard, createProfileTypeKeyboard } from '../constants/keyboards';
import { prisma } from '../db/postgres';
import { candidatesEnded } from '../functions/candidatesEnded';
import { getCandidate } from '../functions/db/getCandidate';
import { sendForm } from '../functions/sendForm';
import { MyContext } from '../typescript/context';

export async function cannotSendComplainStep(ctx: MyContext) {    
    const existingUser = await prisma.user.findUnique({
        where: { id: String(ctx.message!.from.id) },
    });

    if (existingUser) {
        ctx.session.step = 'search_people'

        await ctx.reply("✨🔍", {
            reply_markup: answerFormKeyboard()
        });

        const candidate = await getCandidate(ctx)
        ctx.logger.info(candidate, 'This is new candidate')

        if (candidate) {    
            await sendForm(ctx, candidate || null, { myForm: false })
        } else {
            await candidatesEnded(ctx)
        }
    } else {
        if (ctx.session.privacyAccepted) {
            ctx.session.step = "create_profile_type"

            await ctx.reply(ctx.t('profile_type_title'), {
                reply_markup: createProfileTypeKeyboard(ctx.t)
            });
        } else {
            ctx.session.step = "accept_privacy";

            await ctx.reply(ctx.t('privacy_message'), {
                reply_markup: acceptPrivacyKeyboard(ctx.t),
            });
        }
    }
} 