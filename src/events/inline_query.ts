import { prisma } from "../db/postgres";

import { buildTextForm } from "../functions/sendForm";
import { InlineQueryResult } from "grammy/types";
import { MyContext } from "../typescript/context";
import { IFile } from "../typescript/interfaces/IFile";

export const inlineQueryEvent = async (ctx: MyContext) => {
    const userId = String(ctx.from!.id);

    try {
        // Получаем анкету пользователя
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
                isActive: true
            }
        });

        if (!user) {
            await ctx.answerInlineQuery([{
                type: "article",
                id: "no_profile",
                title: ctx.t("no_profile"),
                description: ctx.t("no_profile_description"),
                input_message_content: {
                    message_text: ctx.t("no_profile_message", { botname: process.env.BOT_USERNAME || "" })
                }
            }], { cache_time: 0 });
            return;
        }
        const text = await buildTextForm(ctx, user, { isInline: true })

        // Получаем все фото пользователя
        let mediaGroup: IFile[] = [];
        if (user.files) {
            try {
                mediaGroup = JSON.parse(user.files as any);
            } catch (error) {
                console.error("Error parsing files:", error);
            }
        }
        console.log(mediaGroup)

        const results: InlineQueryResult[] = [];

        // Добавляем фото
        if (mediaGroup.length > 0) {
            results.push({
                type: mediaGroup[0].type as any,
                id: "photo",
                photo_file_id: mediaGroup[0].media,
                title: ctx.t("share_profile"),
                description: text,
                caption: text + `\n\n👉 @${process.env.BOT_USERNAME}`,
                reply_markup: {
                    inline_keyboard: [[
                        { text: "Открыть анкету", url: `t.me/${process.env.BOT_USERNAME}` }
                    ]]
                }
            });
        }

        await ctx.answerInlineQuery(results, { cache_time: 0 });
    } catch (error) {
        console.error("Error in inline query:", error);
        await ctx.answerInlineQuery([{
            type: "article",
            id: "error",
            title: ctx.t("error_occurred"),
            description: ctx.t("error_occurred_description"),
            input_message_content: {
                message_text: ctx.t("error_occurred_description")
            }
        }], { cache_time: 0 });
    }
}