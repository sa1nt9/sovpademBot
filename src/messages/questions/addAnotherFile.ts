import { someFilesAddedKeyboard, fileKeyboard, profileKeyboard, allRightKeyboard } from "../../constants/keyboards";
import { MyContext } from "../../typescript/context";
import { saveUser } from "../../functions/db/saveUser";
import { sendForm } from "../../functions/sendForm";
import { prisma } from "../../db/postgres";
import { getUserProfile } from "../../functions/db/profilesService";
import { ProfileType } from "@prisma/client";

export const addAnotherFileQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;

    if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
        ctx.session.activeProfile.tempFiles = [];
        ctx.session.step = 'profile'
        ctx.session.isEditingProfile = false;
        ctx.session.additionalFormInfo.canGoBack = false


        await sendForm(ctx)
        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else if (message === ctx.t("its_all_save_files")) {
        if (ctx.session.additionalFormInfo.canGoBack) {
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
        if (isVideo && ctx.message?.video?.duration && ctx.message?.video?.duration < 15) {
            await ctx.reply(ctx.t('video_must_be_less_15'), {
                reply_markup: someFilesAddedKeyboard(ctx.t, ctx.session)
            });
        } else if (isImage || isVideo) {
            const file = ctx.message.photo ? ctx.message.photo[ctx.message.photo.length - 1] : ctx.message.video;

            ctx.session.activeProfile.tempFiles?.push({ type: isImage ? 'photo' : 'video', media: file?.file_id || '' });

            if (ctx.session.activeProfile.tempFiles?.length === 2) {
                await ctx.reply(ctx.t(isImage ? 'photo_added' : "video_added", { uploaded: 2 }), {
                    reply_markup: someFilesAddedKeyboard(ctx.t, ctx.session)
                });
            } else {
                if (ctx.session.additionalFormInfo.canGoBack) {
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
            const profile = await getUserProfile(String(ctx.message!.from.id), ctx.session.activeProfile.profileType,(ctx.session.activeProfile as any).subType)
            const files = profile?.files || []
            
            await ctx.reply(ctx.t('second_file_question'), {
                reply_markup: fileKeyboard(ctx.t, ctx.session, files.length > 0)
            });
        }
    }
} 