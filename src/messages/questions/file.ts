import { fileKeyboard, profileKeyboard, someFilesAddedKeyboard, allRightKeyboard } from "../../constants/keyboards";
import { MyContext } from "../../typescript/context";
import { saveUser } from "../../functions/db/saveUser";
import { sendForm } from "../../functions/sendForm";
import { prisma } from "../../db/postgres";
import { getUserProfile } from "../../functions/db/profilesService";
import { ProfileType } from "@prisma/client";

export const fileQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ 
        userId, 
        question: 'file', 
        input: message,
        hasPhoto: !!ctx.message?.photo,
        hasVideo: !!ctx.message?.video,
        profileType: ctx.session.activeProfile?.profileType
    }, 'User at file upload stage');
    
    if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
        ctx.logger.info({ userId }, 'User cancelling file upload and returning to profile');
        ctx.session.activeProfile.tempFiles = [];
        ctx.session.question = "years";
        ctx.session.step = 'profile'
        ctx.session.isEditingProfile = false;
        ctx.session.additionalFormInfo.canGoBack = false

        await sendForm(ctx)
        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else {
        const profile = await getUserProfile(String(ctx.message!.from.id), ctx.session.activeProfile.profileType, (ctx.session.activeProfile as any).subType)
        const files = profile?.files || []

        if (message === ctx.t("leave_current_m") && profile?.files && files.length > 0) {
            ctx.logger.info({ userId, filesCount: files.length }, 'User keeping current files');
            await saveUser(ctx, { onlyProfile: ctx.session.additionalFormInfo.canGoBack })
            
            await sendForm(ctx)
            
            ctx.session.additionalFormInfo.canGoBack = false
            ctx.session.question = "all_right";

            await ctx.reply(ctx.t('all_right_question'), {
                reply_markup: allRightKeyboard(ctx.t)
            });
        } else {
            const isImage = ctx.message?.photo;
            const isVideo = ctx.message?.video
            
            if (isVideo && ctx.message?.video?.duration && ctx.message?.video?.duration > 15) {
                ctx.logger.warn({ 
                    userId, 
                    videoDuration: ctx.message.video.duration 
                }, 'Video exceeds maximum duration');
                
                await ctx.reply(ctx.t('video_must_be_less_15'), {
                    reply_markup: fileKeyboard(ctx.t, ctx.session, files.length > 0)
                });
            } else if (isImage || isVideo) {
                const file = ctx.message.photo ? ctx.message.photo[ctx.message.photo.length - 1] : ctx.message.video;
                const fileType = isImage ? 'photo' : 'video';
                
                ctx.logger.info({ 
                    userId, 
                    fileType,
                    fileId: file?.file_id
                }, 'User uploaded media file');
                
                ctx.session.activeProfile.tempFiles = [{ type: fileType, media: file?.file_id || '' }];
                ctx.session.question = "add_another_file";

                await ctx.reply(ctx.t(isImage ? 'photo_added' : "video_added", { uploaded: 1 }), {
                    reply_markup: someFilesAddedKeyboard(ctx.t, ctx.session)
                });
            } else {
                ctx.logger.warn({ userId }, 'User sent invalid media type or text');
                await ctx.reply(ctx.t('second_file_question'), {
                    reply_markup: fileKeyboard(ctx.t, ctx.session, files.length > 0)
                });
            }
        }
    }
} 