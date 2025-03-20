import { answerFormKeyboard, answerLikesFormKeyboard, complainKeyboard, continueSeeFormsKeyboard, goBackKeyboard } from '../constants/keyboards';
import { continueSeeLikesForms } from '../functions/continueSeeLikesForms';
import { getCandidate } from '../functions/db/getCandidate';
import { getOneLike } from '../functions/db/getOneLike';
import { sendForm } from '../functions/sendForm';
import { sendMutualSympathyAfterAnswer } from '../functions/sendMutualSympathyAfterAnswer';
import { MyContext } from '../typescript/context';

export async function complainStep(ctx: MyContext) {
    const message = ctx.message!.text;

    if (message === '1 🔞') {
        ctx.session.additionalFormInfo.reportType = 'adult_content';
        ctx.session.step = 'complain_text';

        await ctx.reply(ctx.t('write_complain_comment'), {
            reply_markup: goBackKeyboard(ctx.t)
        });
    } else if (message === '2 💰') {
        ctx.session.additionalFormInfo.reportType = 'sale';
        ctx.session.step = 'complain_text';

        await ctx.reply(ctx.t('write_complain_comment'), {
            reply_markup: goBackKeyboard(ctx.t)
        });
    } else if (message === '3 💩') {
        ctx.session.additionalFormInfo.reportType = 'dislike';
        ctx.session.step = 'complain_text';

        await ctx.reply(ctx.t('write_complain_comment'), {
            reply_markup: goBackKeyboard(ctx.t)
        });
    } else if (message === '4 🦨') {
        ctx.session.additionalFormInfo.reportType = 'other';
        ctx.session.step = 'complain_text';

        await ctx.reply(ctx.t('write_complain_comment'), {
            reply_markup: goBackKeyboard(ctx.t)
        });
    } else if (message === '✖️') {
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
            await sendForm(ctx, candidate || null, { myForm: false });
        }

            
        } else {
            await ctx.reply(ctx.t('no_such_answer'), {
                reply_markup: complainKeyboard()
            });
        }
    } 