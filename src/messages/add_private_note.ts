import { goBackKeyboard, skipKeyboard, textOrVideoKeyboard } from '../constants/keyboards';
import { MyContext } from '../typescript/context';

export async function addPrivateNoteStep(ctx: MyContext) {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    const candidateId = ctx.session.currentCandidateProfile?.id;
    
    ctx.logger.info({ userId, step: 'add_private_note', candidateId }, 'User adding private note to like');

    if (message === ctx.t('back')) {
        ctx.logger.info({ userId }, 'User cancelled private note creation');
        ctx.session.step = 'text_or_video_to_user'

        await ctx.reply(ctx.t('text_or_video_to_user'), {
            reply_markup: textOrVideoKeyboard(ctx.t)
        })

        return
    } else if (message && message.length > 400) {
        ctx.logger.warn({ userId, messageLength: message.length }, 'Private note too long');
        await ctx.reply(ctx.t('private_note_max_length'));
        return;
    } else if (!message) {
        ctx.logger.warn({ userId }, 'User sent empty message for private note');
        await ctx.reply(ctx.t('write_text_note'), {
            reply_markup: goBackKeyboard(ctx.t)
        })
    } else {
        ctx.logger.info({ 
            userId, 
            candidateId,
            noteLength: message.length 
        }, 'User successfully added private note');
        
        ctx.session.privateNote = message;
        ctx.session.step = 'added_private_note'

        await ctx.reply(ctx.t('after_note_you_want_to_add_text_to_user'), {
            reply_markup: skipKeyboard(ctx.t, true),
            parse_mode: 'Markdown'
        })
    }

} 