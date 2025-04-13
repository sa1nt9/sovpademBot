import { answerFormKeyboard } from '../constants/keyboards';
import { candidatesEnded } from '../functions/candidatesEnded';
import { getCandidate } from '../functions/db/getCandidate';
import { sendForm } from '../functions/sendForm';
import { startSearchingPeople } from '../functions/startSearchingPeople';
import { MyContext } from '../typescript/context';

export async function continueSeeFormsStep(ctx: MyContext) {
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ userId, step: 'continue_see_forms' }, 'User continuing to browse profiles');
    
    await startSearchingPeople(ctx, { setActive: true })

    const candidate = await getCandidate(ctx)
    ctx.logger.info({ userId, candidateId: candidate?.id }, 'Retrieved next candidate for user');

    if (candidate) {
        await sendForm(ctx, candidate || null, { myForm: false })
    } else {
        ctx.logger.info({ userId }, 'No more candidates available');
        await candidatesEnded(ctx)
    }

} 