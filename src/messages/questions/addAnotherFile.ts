import { someFilesAddedKeyboard, fileKeyboard, profileKeyboard, allRightKeyboard } from "../../constants/keyboards";
import { MyContext } from "../../typescript/context";
import { saveUser } from "../../functions/db/saveUser";
import { sendForm } from "../../functions/sendForm";
import { prisma } from "../../db/postgres";
import { getUserProfile } from "../../functions/db/profilesService";
import { ProfileType } from "@prisma/client";

export const addAnotherFileQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    const userId = String(ctx.from!.id);
    
    ctx.logger.info({ 
        userId, 
        question: 'add_another_file', 
        input: message,
        hasPhoto: !!ctx.message?.photo,
        hasVideo: !!ctx.message?.video,
        currentFilesCount: ctx.session.activeProfile.tempFiles?.length || 0,
        profileType: ctx.session.activeProfile?.profileType
    }, 'User at additional file upload stage');

    if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
        ctx.logger.info({ userId }, 'User cancelled additional file upload and returning to profile');
        ctx.session.activeProfile.tempFiles = [];
        ctx.session.step = 'profile'
        ctx.session.isEditingProfile = false;
        ctx.session.additionalFormInfo.canGoBack = false


        await sendForm(ctx)
        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else if (message === ctx.t("its_all_save_files")) {
        ctx.logger.info({ 
            userId, 
            filesCount: ctx.session.activeProfile.tempFiles?.length || 0 
        }, 'User finished file upload, saving files');
        
        if (ctx.session.additionalFormInfo.canGoBack) {
            ctx.logger.info({ userId }, 'Returning to profile after file upload in edit mode');
            ctx.session.step = 'profile'
            ctx.session.activeProfile.files = ctx.session.activeProfile.tempFiles || []
            ctx.session.activeProfile.tempFiles = []
            ctx.session.additionalFormInfo.canGoBack = false
            
            await saveUser(ctx, { onlyProfile: true })

            await sendForm(ctx)
            await ctx.reply(ctx.t('profile_menu'), {
                reply_markup: profileKeyboard()
            });
        } else {
            ctx.logger.info({ userId }, 'Proceeding to final confirmation after file upload');
            ctx.session.question = "all_right";

            ctx.session.activeProfile.files = ctx.session.activeProfile.tempFiles || []
            ctx.session.activeProfile.tempFiles = []
            ctx.session.additionalFormInfo.canGoBack = false

            await saveUser(ctx)

            await sendForm(ctx)
            await ctx.reply(ctx.t('all_right_question'), {
                reply_markup: allRightKeyboard(ctx.t)
            });
        }
    } else {
        const isImage = ctx.message?.photo;
        const isVideo = ctx.message?.video;
        
        if (isVideo && ctx.message?.video?.duration && ctx.message?.video?.duration > 15) {
            ctx.logger.warn({ 
                userId, 
                videoDuration: ctx.message.video.duration 
            }, 'Additional video exceeds maximum duration');
            
            await ctx.reply(ctx.t('video_must_be_less_15'), {
                reply_markup: someFilesAddedKeyboard(ctx.t, ctx.session)
            });
        } else if (isImage || isVideo) {
            const file = ctx.message.photo ? ctx.message.photo[ctx.message.photo.length - 1] : ctx.message.video;
            const fileType = isImage ? 'photo' : 'video';
            
            ctx.logger.info({ 
                userId, 
                fileType,
                fileId: file?.file_id,
                fileNumber: (ctx.session.activeProfile.tempFiles?.length || 0) + 1
            }, 'User uploaded additional media file');

            ctx.session.activeProfile.tempFiles?.push({ type: fileType, media: file?.file_id || '' });

            if (ctx.session.activeProfile.tempFiles?.length === 2) {
                ctx.logger.info({ userId, filesCount: 2 }, 'User reached maximum number of files');
                await ctx.reply(ctx.t(isImage ? 'photo_added' : "video_added", { uploaded: 2 }), {
                    reply_markup: someFilesAddedKeyboard(ctx.t, ctx.session)
                });
            } else {
                ctx.logger.info({ userId }, 'Automatically proceeding with max files reached');
                if (ctx.session.additionalFormInfo.canGoBack) {
                    ctx.logger.info({ userId }, 'Returning to profile with new files in edit mode');
                    ctx.session.step = 'profile'
                    ctx.session.activeProfile.files = ctx.session.activeProfile.tempFiles || []
                    ctx.session.activeProfile.tempFiles = []
                    ctx.session.additionalFormInfo.canGoBack = false

                    await saveUser(ctx, { onlyProfile: true })

                    await sendForm(ctx)
                    await ctx.reply(ctx.t('profile_menu'), {
                        reply_markup: profileKeyboard()
                    });
                } else {
                    ctx.logger.info({ userId }, 'Proceeding to final confirmation with new files');
                    ctx.session.question = "all_right";
                    ctx.session.activeProfile.files = ctx.session.activeProfile.tempFiles || []
                    ctx.session.activeProfile.tempFiles = []
                    await saveUser(ctx)

                    await sendForm(ctx)

                    await ctx.reply(ctx.t('all_right_question'), {
                        reply_markup: allRightKeyboard(ctx.t)
                    });
                }
            }

        } else {
            ctx.logger.warn({ userId, message }, 'User sent invalid media type or text');
            const profile = await getUserProfile(String(ctx.message!.from.id), ctx.session.activeProfile.profileType,(ctx.session.activeProfile as any).subType)
            const files = profile?.files || []
            
            await ctx.reply(ctx.t('second_file_question'), {
                reply_markup: fileKeyboard(ctx.t, ctx.session, files.length > 0)
            });
        }
    }
} 