import { fileKeyboard, profileKeyboard, someFilesAddedKeyboard, allRightKeyboard } from "../../constants/keyboards";
import { MyContext } from "../../typescript/context";
import { saveForm } from "../../functions/db/saveForm";
import { sendForm } from "../../functions/sendForm";
import { prisma } from "../../db/postgres";

export const fileQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    
    if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
        ctx.session.activeProfile.tempFiles = [];
        ctx.session.question = "years";
        ctx.session.step = 'profile'
        ctx.session.additionalFormInfo.canGoBack = false


        await sendForm(ctx)
        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else {
        const user = await prisma.user.findUnique({
            where: { id: String(ctx.message!.from.id) },
            // select: { files: true },
        });
        // const files = user?.files ? JSON.parse(user?.files as any) : []
        const files = []

        if (message === ctx.t("leave_current_m") && (user as any)?.files && files.length > 0) {
            ctx.logger.info('leave_current_m')
            await saveForm(ctx)

            await sendForm(ctx)

            ctx.session.question = "all_right";
            ctx.logger.info({ question: ctx.session.question }, 'all_right')


            await ctx.reply(ctx.t('all_right_question'), {
                reply_markup: allRightKeyboard(ctx.t)
            });
        } else {
            const isImage = ctx.message?.photo;
            const isVideo = ctx.message?.video
            if (isVideo && ctx.message?.video?.duration && ctx.message?.video?.duration < 15) {
                await ctx.reply(ctx.t('video_must_be_less_15'), {
                    reply_markup: fileKeyboard(ctx.t, ctx.session, files.length > 0)
                });
            } else if (isImage || isVideo) {
                const file = ctx.message.photo ? ctx.message.photo[ctx.message.photo.length - 1] : ctx.message.video;

                ctx.session.activeProfile.tempFiles = [{ type: isImage ? 'photo' : 'video', media: file?.file_id || '' }];
                ctx.session.question = "add_another_file";

                await ctx.reply(ctx.t(isImage ? 'photo_added' : "video_added", { uploaded: 1 }), {
                    reply_markup: someFilesAddedKeyboard(ctx.t, ctx.session)
                });
            } else {
                await ctx.reply(ctx.t('second_file_question'), {
                    reply_markup: fileKeyboard(ctx.t, ctx.session, files.length > 0)
                });
            }
        }
    }
} 