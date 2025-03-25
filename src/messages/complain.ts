import { complainTypes } from '../constants/complain';
import { answerFormKeyboard, answerLikesFormKeyboard, complainKeyboard, continueSeeFormsKeyboard, goBackKeyboard, sendComplainWithoutCommentKeyboard } from '../constants/keyboards';
import { continueSeeLikesForms } from '../functions/continueSeeLikesForms';
import { candidatesEnded } from '../functions/candidatesEnded';
import { getCandidate } from '../functions/db/getCandidate';
import { sendForm } from '../functions/sendForm';
import { sendMutualSympathyAfterAnswer } from '../functions/sendMutualSympathyAfterAnswer';
import { MyContext } from '../typescript/context';


export async function complainStep(ctx: MyContext) {
    const message = ctx.message!.text || '';

    // Обработка жалоб разных типов
    if (message && message in complainTypes) {
        ctx.session.additionalFormInfo.reportType = complainTypes[message];
        ctx.session.step = 'complain_text';
        
        await ctx.reply(ctx.t('write_complain_comment'), {
            reply_markup: sendComplainWithoutCommentKeyboard(ctx.t)
        });
        return;
    }
    
    // Обработка отмены жалобы
    if (message === '✖️') {
        ctx.session.additionalFormInfo.reportedUserId = ''
        if (ctx.session.additionalFormInfo.searchingLikes) {
            ctx.session.step = 'search_people_with_likes'

            await continueSeeLikesForms(ctx)
            
        } else {
            ctx.session.step = 'search_people';

            if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeUserId) {
                await sendMutualSympathyAfterAnswer(ctx)
                return
            }

            await ctx.reply("✨🔍", {
                reply_markup: answerFormKeyboard()
            });

            const candidate = await getCandidate(ctx);

            if (candidate) {
                await sendForm(ctx, candidate || null, { myForm: false });
            } else {
                await candidatesEnded(ctx)
            }
        }
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: complainKeyboard()
        });
    }
} 