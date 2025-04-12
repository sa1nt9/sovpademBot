import { ageKeyboard, answerFormKeyboard, fileKeyboard, profileKeyboard, rouletteStartKeyboard, switchProfileKeyboard, textKeyboard } from '../constants/keyboards';
import { getCandidate } from '../functions/db/getCandidate';
import { sendForm } from '../functions/sendForm';
import { showRouletteStart } from './roulette_start';
import { MyContext } from '../typescript/context';
import { candidatesEnded } from '../functions/candidatesEnded';
import { changeProfileFromStart } from '../functions/changeProfileFromStart';
import { getUserProfiles } from '../functions/db/profilesService';
import { startSearchingPeople } from '../functions/startSearchingPeople';
import { ProfileType } from '@prisma/client';


export async function profileStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const userId = String(ctx.message!.from.id);

    if (message === '1 🚀') {
        await startSearchingPeople(ctx, { setActive: true }) 

        const candidate = await getCandidate(ctx)
        ctx.logger.info(candidate, 'This is new candidate')

        if (candidate) {
            await sendForm(ctx, candidate || null, { myForm: false })
        } else {
            await candidatesEnded(ctx)
        }

    } else if (message === '2') {
        ctx.session.isEditingProfile = true;
        ctx.session.additionalFormInfo.selectedProfileType = ctx.session.activeProfile.profileType
        if (ctx.session.activeProfile.profileType !== ProfileType.RELATIONSHIP) {
            ctx.session.additionalFormInfo.selectedSubType = ctx.session.activeProfile.subType
        }

        await changeProfileFromStart(ctx)
    } else if (message === '3') {
        ctx.session.step = 'questions'
        ctx.session.question = 'file'

        ctx.session.additionalFormInfo.selectedProfileType = ctx.session.activeProfile.profileType
        if (ctx.session.activeProfile.profileType !== ProfileType.RELATIONSHIP) {
            ctx.session.additionalFormInfo.selectedSubType = ctx.session.activeProfile.subType
        }

        ctx.session.additionalFormInfo.canGoBack = true

        await ctx.reply(ctx.t('file_question'), {
            reply_markup: fileKeyboard(ctx.t, ctx.session, true)
        });

    } else if (message === '4') {
        ctx.session.step = 'questions'
        ctx.session.question = "text";

        ctx.session.additionalFormInfo.selectedProfileType = ctx.session.activeProfile.profileType
        if (ctx.session.activeProfile.profileType !== ProfileType.RELATIONSHIP) {
            ctx.session.additionalFormInfo.selectedSubType = ctx.session.activeProfile.subType
        }
        
        ctx.session.additionalFormInfo.canGoBack = true

        await ctx.reply(ctx.t('text_question', {
            profileType: ctx.session.activeProfile.profileType
        }), {
            reply_markup: textKeyboard(ctx.t, ctx.session)
        });
    } else if (message === '5') {
        ctx.session.step = "switch_profile";

        const profiles = await getUserProfiles(userId, ctx);

        await ctx.reply(ctx.t('switch_profile_message'), {
            reply_markup: switchProfileKeyboard(ctx.t, profiles)
        });
    } else if (message === '6 🎲') {
        ctx.session.step = 'roulette_start';

        await showRouletteStart(ctx);
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: profileKeyboard()
        });
    }
} 