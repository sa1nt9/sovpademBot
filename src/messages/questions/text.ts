import { fileKeyboard, profileKeyboard, textKeyboard } from "../../constants/keyboards";
import { MyContext } from "../../typescript/context";
import { hasLinks } from "../../functions/hasLinks";
import { saveForm } from "../../functions/db/saveForm";
import { sendForm } from "../../functions/sendForm";
import { prisma } from "../../db/postgres";

export const textQuestion = async (ctx: MyContext) => {
    const message = ctx.message!.text;
    
    if (message === ctx.t("go_back") && ctx.session.additionalFormInfo.canGoBack) {
        ctx.session.question = "years";
        ctx.session.step = 'profile'
        ctx.session.additionalFormInfo.canGoBack = false


        await sendForm(ctx)

        await ctx.reply(ctx.t('profile_menu'), {
            reply_markup: profileKeyboard()
        });
    } else if (message && message.length > 1000) {
        await ctx.reply(ctx.t('long_text'), {
            reply_markup: textKeyboard(ctx.t, ctx.session)
        });
    } else if (hasLinks(message || "")) {
        await ctx.reply(ctx.t('this_text_breaks_the_rules'), {
            reply_markup: textKeyboard(ctx.t, ctx.session)
        });
    } else {
        ctx.session.activeProfile.description = (!message || message === ctx.t('skip')) ? "" : message;
        if (ctx.session.additionalFormInfo.canGoBack) {
            ctx.session.question = "years";
            ctx.session.step = 'profile'
            ctx.session.additionalFormInfo.canGoBack = false

            await saveForm(ctx)

            await sendForm(ctx)
            await ctx.reply(ctx.t('profile_menu'), {
                reply_markup: profileKeyboard()
            });
        } else {
            ctx.session.question = "file";
            const user = await prisma.user.findUnique({
                where: { id: String(ctx.message!.from.id) },
                // select: { files: true },
            });
            // const files = user?.files ? JSON.parse(user?.files as any) : []
// 
            // await ctx.reply(ctx.t('file_question'), {
            //     reply_markup: fileKeyboard(ctx.t, ctx.session, files.length > 0)
            // });
        }
    }
} 