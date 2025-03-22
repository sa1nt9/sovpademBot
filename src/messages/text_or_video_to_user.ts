import { answerFormKeyboard } from '../constants/keyboards';
import { getCandidate } from '../functions/db/getCandidate';
import { saveLike } from '../functions/db/saveLike';
import { sendForm } from '../functions/sendForm';
import { sendLikesNotification } from '../functions/sendLikesNotification';
import { sendMutualSympathyAfterAnswer } from '../functions/sendMutualSympathyAfterAnswer';
import { MyContext } from '../typescript/context';

export async function textOrVideoToUserStep(ctx: MyContext) {
    const message = ctx.message!.text;

    if (!ctx.session.currentCandidate || !ctx.session.additionalFormInfo.awaitingLikeContent) {
        ctx.session.step = 'search_people';
        await ctx.reply(ctx.t('operation_cancelled'), {
            reply_markup: answerFormKeyboard()
        });
        const candidate = await getCandidate(ctx);
        await sendForm(ctx, candidate || null, { myForm: false });
        ctx.logger.info(candidate, 'This is new candidate')

        return;
    }

    if (message === ctx.t('go_back')) {
        ctx.session.step = 'search_people'
        ctx.session.question = 'years'
        ctx.session.additionalFormInfo.awaitingLikeContent = false;

        await ctx.reply("✨🔍", {
            reply_markup: answerFormKeyboard()
        });

        const candidate = await getCandidate(ctx)
        ctx.logger.info(candidate, 'This is new candidate')

        await sendForm(ctx, candidate || null, { myForm: false })

        return
    }

    const video = ctx.message?.video;
    const voice = ctx.message?.voice;
    const videoNote = ctx.message?.video_note;

    if (video) {
        if (video.duration && video.duration > 15) {
            await ctx.reply(ctx.t('video_must_be_less_15'));
            return;
        }

        await saveLike(ctx, ctx.session.currentCandidate.id, true, {
            videoFileId: video.file_id
        });

        await sendLikesNotification(ctx, ctx.session.currentCandidate.id);
    } else if (voice) {
        if (voice.duration && voice.duration > 60) {
            await ctx.reply(ctx.t('voice_must_be_less_60'));
            return;
        }

        await saveLike(ctx, ctx.session.currentCandidate.id, true, {
            voiceFileId: voice.file_id
        });

        await sendLikesNotification(ctx, ctx.session.currentCandidate.id);
    } else if (videoNote) {
        await saveLike(ctx, ctx.session.currentCandidate.id, true, {
            videoNoteFileId: videoNote.file_id
        });

        await sendLikesNotification(ctx, ctx.session.currentCandidate.id);
    } else if (message) {
        await saveLike(ctx, ctx.session.currentCandidate.id, true, {
            message: message
        });

        await sendLikesNotification(ctx, ctx.session.currentCandidate.id);
    } else {
        await ctx.reply(ctx.t('not_message_and_not_video'));
    }

    ctx.session.step = 'search_people';
    ctx.session.additionalFormInfo.awaitingLikeContent = false;

    await ctx.reply(ctx.t('like_sended_wait_for_answer'), {
        reply_markup: {
            remove_keyboard: true
        }
    });

    if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeUserId) {
        await sendMutualSympathyAfterAnswer(ctx)
        return
    }

    await ctx.reply("✨🔍", {
        reply_markup: answerFormKeyboard()
    });
    const candidate = await getCandidate(ctx);
    await sendForm(ctx, candidate || null, { myForm: false });
    ctx.logger.info(candidate, 'This is new candidate')
} 