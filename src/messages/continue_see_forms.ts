import { answerFormKeyboard } from '../constants/keyboards';
import { candidatesEnded } from '../functions/candidatesEnded';
import { getCandidate } from '../functions/db/getCandidate';
import { sendForm } from '../functions/sendForm';
import { startSearchingPeople } from '../functions/startSearchingPeople';
import { MyContext } from '../typescript/context';

export async function continueSeeFormsStep(ctx: MyContext) {
    await startSearchingPeople(ctx, { setActive: true })

    const candidate = await getCandidate(ctx)
    ctx.logger.info(candidate, 'This is new candidate')

    if (candidate) {
        await sendForm(ctx, candidate || null, { myForm: false })
    } else {
        await candidatesEnded(ctx)
    }

} 