import { answerFormKeyboard, complainKeyboard, goBackKeyboard } from '../constants/keyboards';
import { getCandidate } from '../functions/db/getCandidate';
import { sendForm } from '../functions/sendForm';
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
    } else if (message === '9') {
        ctx.session.step = 'search_people';

        await ctx.reply("✨🔍", {
            reply_markup: answerFormKeyboard()
        });

        const candidate = await getCandidate(ctx);
        await sendForm(ctx, candidate || null, { myForm: false });
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: complainKeyboard()
        });
    }
} 