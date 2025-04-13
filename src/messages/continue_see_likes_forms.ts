import { continueSeeLikesForms } from '../functions/continueSeeLikesForms';
import { MyContext } from '../typescript/context';

export async function continueSeeLikesFormsStep(ctx: MyContext) {
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ userId, step: 'continue_see_likes_forms' }, 'User continuing to browse received likes');
    
    ctx.session.step = 'search_people_with_likes'
    ctx.session.additionalFormInfo.searchingLikes = true

    await continueSeeLikesForms(ctx)
} 