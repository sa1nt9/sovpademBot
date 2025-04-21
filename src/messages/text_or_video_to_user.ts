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
    const userId = String(ctx.from?.id);
    
    ctx.logger.info({ userId }, 'User in message sending menu');

    if (!ctx.session.currentCandidateProfile) {
        ctx.logger.warn({ userId }, 'No current candidate profile for message');
        ctx.session.step = 'search_people';
        await ctx.reply(ctx.t('operation_cancelled'), {
            reply_markup: answerFormKeyboard()
        });
        const candidate = await getCandidate(ctx);
        
        if (candidate) {
            await sendForm(ctx, candidate || null, { myForm: false });
        } else {
            await candidatesEnded(ctx)
        }

        return;
    }
    
    const candidateId = ctx.session.currentCandidateProfile.id;
    const candidateUserId = ctx.session.currentCandidateProfile.userId;
    
    ctx.logger.info({ userId, candidateId }, 'Processing message to candidate');

    let isPrivateNote = ctx.session.step === 'added_private_note';

    if (isPrivateNote && message === ctx.t('skip')) {
        ctx.logger.info({ userId, candidateId }, 'User skipped additional note');
        await saveLike(ctx, candidateId, true, {
            privateNote: ctx.session.privateNote
        });

        await sendLikesNotification(ctx, candidateUserId, candidateId, ctx.session.activeProfile.id, ctx.session.activeProfile.profileType, ctx.session.activeProfile.profileType !== 'RELATIONSHIP' ? ctx.session.activeProfile.subType : "");
        
    } else {

        if (message === ctx.t('go_back')) {
            ctx.logger.info({ userId }, 'User cancelled message sending');
            await startSearchingPeople(ctx, { setActive: true }) 
    
            const candidate = await getCandidate(ctx)
    
            if (candidate) {
                await sendForm(ctx, candidate || null, { myForm: false })
            } else {
                await candidatesEnded(ctx)
            }
    
            return
        } else if (message === ctx.t('add_private_note') && !isPrivateNote) {
            ctx.logger.info({ userId, candidateId }, 'User adding private note');
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
            ctx.logger.info({ userId, candidateId, duration: video.duration }, 'User sending video');
            if (video.duration && video.duration > 15) {
                ctx.logger.warn({ userId, duration: video.duration }, 'Video too long');
                await ctx.reply(ctx.t('video_must_be_less_15'));
                return;
            }
    
            await saveLike(ctx, candidateId, true, {
                videoFileId: video.file_id,
                privateNote: isPrivateNote ? ctx.session.privateNote : undefined
            });
    
            await sendLikesNotification(ctx, candidateUserId, candidateId, ctx.session.activeProfile.id, ctx.session.activeProfile.profileType, ctx.session.activeProfile.profileType !== 'RELATIONSHIP' ? ctx.session.activeProfile.subType : "");
        } else if (voice) {
            ctx.logger.info({ userId, candidateId, duration: voice.duration }, 'User sending voice message');
            if (voice.duration && voice.duration > 60) {
                ctx.logger.warn({ userId, duration: voice.duration }, 'Voice message too long');
                await ctx.reply(ctx.t('voice_must_be_less_60'));
                return;
            }
    
            await saveLike(ctx, candidateId, true, {
                voiceFileId: voice.file_id,
                privateNote: isPrivateNote ? ctx.session.privateNote : undefined
            });
    
            await sendLikesNotification(ctx, candidateUserId, candidateId, ctx.session.activeProfile.id, ctx.session.activeProfile.profileType, ctx.session.activeProfile.profileType !== 'RELATIONSHIP' ? ctx.session.activeProfile.subType : "");
        } else if (videoNote) {
            ctx.logger.info({ userId, candidateId }, 'User sending video note');
            await saveLike(ctx, candidateId, true, {
                videoNoteFileId: videoNote.file_id,
                privateNote: isPrivateNote ? ctx.session.privateNote : undefined
            });
    
            await sendLikesNotification(ctx, candidateUserId, candidateId, ctx.session.activeProfile.id, ctx.session.activeProfile.profileType, ctx.session.activeProfile.profileType !== 'RELATIONSHIP' ? ctx.session.activeProfile.subType : "");
        } else if (message) {
            ctx.logger.info({ userId, candidateId, messageLength: message.length }, 'User sending text message');
            if (message.length > 400) {
                ctx.logger.warn({ userId, messageLength: message.length }, 'Message too long');
                await ctx.reply(ctx.t('long_message'));
                return;
            } else if (hasLinks(message)) {
                ctx.logger.warn({ userId }, 'Message contains links');
                await ctx.reply(ctx.t('this_text_breaks_the_rules'));
                return;
            }
    
            await saveLike(ctx, candidateId, true, {
                message: message,
                privateNote: isPrivateNote ? ctx.session.privateNote : undefined
            });
    
            await sendLikesNotification(ctx, candidateUserId, candidateId, ctx.session.activeProfile.id, ctx.session.activeProfile.profileType, ctx.session.activeProfile.profileType !== 'RELATIONSHIP' ? ctx.session.activeProfile.subType : "");
        } else {
            ctx.logger.warn({ userId }, 'Invalid message type');
            await ctx.reply(ctx.t('not_message_and_not_video'));
        }
    }

    ctx.logger.info({ userId, candidateId }, 'Message sent successfully');
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

    if (candidate) {
        await sendForm(ctx, candidate || null, { myForm: false });
    } else {
        await candidatesEnded(ctx)
    }
} 