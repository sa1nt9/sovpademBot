import { goBackKeyboard, skipKeyboard, textOrVideoKeyboard } from '../constants/keyboards';
import { MyContext } from '../typescript/context';

export async function addPrivateNoteStep(ctx: MyContext) {
    const message = ctx.message!.text;

    if (message === ctx.t('back')) {
        ctx.session.step = 'text_or_video_to_user'

        await ctx.reply(ctx.t('text_or_video_to_user'), {
            reply_markup: textOrVideoKeyboard(ctx.t)
        })

        return
    } else if (message && message.length > 400) {
        await ctx.reply(ctx.t('private_note_max_length'));
        return;
    } else if (!message) {
        await ctx.reply(ctx.t('write_text_note'), {
            reply_markup: goBackKeyboard(ctx.t)
        })
    } else {
        ctx.session.privateNote = message;
        ctx.session.step = 'added_private_note'

        await ctx.reply(ctx.t('after_note_you_want_to_add_text_to_user'), {
            reply_markup: skipKeyboard(ctx.t, true),
            parse_mode: 'Markdown'
        })
    }

} 