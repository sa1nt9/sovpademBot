import { ageKeyboard, answerFormKeyboard, fileKeyboard, profileKeyboard, rouletteStartKeyboard, textKeyboard } from '../constants/keyboards';
import { getCandidate } from '../functions/db/getCandidate';
import { sendForm } from '../functions/sendForm';
import { showRouletteStart } from './roulette_start';
import { MyContext } from '../typescript/context';
import { candidatesEnded } from '../functions/candidatesEnded';

export async function profileStep(ctx: MyContext) {
    const message = ctx.message!.text;

    if (message === '1 🚀') {
        ctx.session.step = 'search_people'

        await ctx.reply("✨🔍", {
            reply_markup: answerFormKeyboard(),
        });

        const candidate = await getCandidate(ctx)
        ctx.logger.info(candidate, 'This is new candidate')

        if (candidate) {
            await sendForm(ctx, candidate || null, { myForm: false })   
        } else {
            await candidatesEnded(ctx)
        }

    } else if (message === '2') {
        ctx.session.step = 'questions'
        ctx.session.question = 'years'

        await ctx.reply(ctx.t('years_question'), {
            reply_markup: ageKeyboard(ctx.session)
        });

    } else if (message === '3') {
        ctx.session.step = 'questions'
        ctx.session.question = 'file'

        ctx.session.additionalFormInfo.canGoBack = true

        await ctx.reply(ctx.t('file_question'), {
            reply_markup: fileKeyboard(ctx.t, ctx.session, true)
        });

    } else if (message === '4') {
        ctx.session.step = 'questions'
        ctx.session.question = "text";
        ctx.session.additionalFormInfo.canGoBack = true

        await ctx.reply(ctx.t('text_question'), {
            reply_markup: textKeyboard(ctx.t, ctx.session)
        });
    } else if (message === '5 🎲') {
        ctx.session.step = 'roulette_start';
        
        await showRouletteStart(ctx);
    } else {
        await ctx.reply(ctx.t('no_such_answer'), {
            reply_markup: profileKeyboard()
        });
    }
} 