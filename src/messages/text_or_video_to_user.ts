import { answerFormKeyboard, goBackKeyboard } from '../constants/keyboards';
import { candidatesEnded } from '../functions/candidatesEnded';
import { getCandidate } from '../functions/db/getCandidate';
import { saveLike } from '../functions/db/saveLike';
import { hasLinks } from '../functions/hasLinks';
import { sendForm } from '../functions/sendForm';
import { sendLikesNotification } from '../functions/sendLikesNotification';
import { sendMutualSympathyAfterAnswer } from '../functions/sendMutualSympathyAfterAnswer';
import { startSearchingPeople } from '../functions/startSearchingPeople';
import { MyContext } from '../typescript/context';

export async function textOrVideoToUserStep(ctx: MyContext) {
    const message = ctx.message!.text;

    if (!ctx.session.currentCandidateProfile) {
        ctx.session.step = 'search_people';
        await ctx.reply(ctx.t('operation_cancelled'), {
            reply_markup: answerFormKeyboard()
        });
        const candidate = await getCandidate(ctx);
        ctx.logger.info(candidate, 'This is new candidate')

        if (candidate) {
            await sendForm(ctx, candidate || null, { myForm: false });
        } else {
            await candidatesEnded(ctx)
        }

        return;
    }

    let isPrivateNote = ctx.session.step === 'added_private_note';

    if (isPrivateNote && message === ctx.t('skip')) {
        await saveLike(ctx, ctx.session.currentCandidateProfile.id, true, {
            privateNote: ctx.session.privateNote
        });

        await sendLikesNotification(ctx, ctx.session.currentCandidateProfile.userId);
        
    } else {

        if (message === ctx.t('go_back')) {
            await startSearchingPeople(ctx, { setActive: true }) 
    
            const candidate = await getCandidate(ctx)
            ctx.logger.info(candidate, 'This is new candidate')
    
            if (candidate) {
                await sendForm(ctx, candidate || null, { myForm: false })
            } else {
                await candidatesEnded(ctx)
            }
    
            return
        } else if (message === ctx.t('add_private_note') && !isPrivateNote) {
            ctx.session.step = 'add_private_note'
    
            await ctx.reply(ctx.t('add_private_note_message'), {
                reply_markup: goBackKeyboard(ctx.t)
            })
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
    
            await saveLike(ctx, ctx.session.currentCandidateProfile.id, true, {
                videoFileId: video.file_id,
                privateNote: isPrivateNote ? ctx.session.privateNote : undefined
            });
    
            await sendLikesNotification(ctx, ctx.session.currentCandidateProfile.userId);
        } else if (voice) {
            if (voice.duration && voice.duration > 60) {
                await ctx.reply(ctx.t('voice_must_be_less_60'));
                return;
            }
    
            await saveLike(ctx, ctx.session.currentCandidateProfile.id, true, {
                voiceFileId: voice.file_id,
                privateNote: isPrivateNote ? ctx.session.privateNote : undefined
            });
    
            await sendLikesNotification(ctx, ctx.session.currentCandidateProfile.userId);
        } else if (videoNote) {
            await saveLike(ctx, ctx.session.currentCandidateProfile.id, true, {
                videoNoteFileId: videoNote.file_id,
                privateNote: isPrivateNote ? ctx.session.privateNote : undefined
            });
    
            await sendLikesNotification(ctx, ctx.session.currentCandidateProfile.userId);
        } else if (message) {
            if (message.length > 400) {
                await ctx.reply(ctx.t('long_message'));
                return;
            } else if (hasLinks(message)) {
                await ctx.reply(ctx.t('this_text_breaks_the_rules'));
                return;
            }
    
            await saveLike(ctx, ctx.session.currentCandidateProfile.id, true, {
                message: message,
                privateNote: isPrivateNote ? ctx.session.privateNote : undefined
            });
    
            await sendLikesNotification(ctx, ctx.session.currentCandidateProfile.userId);
        } else {
            await ctx.reply(ctx.t('not_message_and_not_video'));
        }
    }


    ctx.session.step = 'search_people';

    await ctx.reply(ctx.t('like_sended_wait_for_answer'), {
        reply_markup: {
            remove_keyboard: true
        }
    });

    if (ctx.session.pendingMutualLike && ctx.session.pendingMutualLikeProfileId) {
        await sendMutualSympathyAfterAnswer(ctx)
        return
    }

    await ctx.reply("✨🔍", {
        reply_markup: answerFormKeyboard()
    });
    const candidate = await getCandidate(ctx);
    ctx.logger.info(candidate, 'This is new candidate')

    if (candidate) {
        await sendForm(ctx, candidate || null, { myForm: false });
    } else {
        await candidatesEnded(ctx)
    }
} 