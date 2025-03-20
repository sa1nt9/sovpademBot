import { continueSeeLikesForms } from '../functions/continueSeeLikesForms';
import { MyContext } from '../typescript/context';

export async function continueSeeLikesFormsStep(ctx: MyContext) {
    ctx.session.step = 'search_people_with_likes'
    ctx.session.additionalFormInfo.searchingLikes = true

    await continueSeeLikesForms(ctx)
} 