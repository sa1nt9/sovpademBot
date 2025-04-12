import { prisma } from "../db/postgres";
import { buildTextForm } from "../functions/sendForm";
import { InlineQueryResult } from "grammy/types";
import { MyContext } from "../typescript/context";
import { encodeId } from "../functions/encodeId";

export const inlineQueryEvent = async (ctx: MyContext) => {
    const userId = String(ctx.from!.id);

    ctx.logger.info({ 
        userId: userId,
        username: ctx.from?.username,
        query: ctx.inlineQuery?.query
    }, 'Processing inline query');

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            }
        });

        if (!user) {
            ctx.logger.info({ userId }, 'User not found for inline query');
            await ctx.answerInlineQuery([{
                type: "article",
                id: "no_profile",
                title: ctx.t("no_profile"),
                description: ctx.t("no_profile_description"),
                input_message_content: {
                    message_text: ctx.t("no_profile_message", { botname: `[${process.env.CHANNEL_NAME || ""}](https://t.me/${process.env.BOT_USERNAME || ""})` }),
                    parse_mode: "Markdown",
                    link_preview_options: {
                        is_disabled: true
                    }
                },
            }], { cache_time: 0 });
            return;
        }

        ctx.logger.info({ userId }, 'Building text form for inline query');
        const text = await buildTextForm(ctx, user, { isInline: true })

        const results: InlineQueryResult[] = [{
            type: "article",
            id: "profile",
            title: ctx.t("share_profile"),
            description: text,
            input_message_content: {
                message_text: ctx.t("inline_message_text", { botname: `[${process.env.CHANNEL_NAME || ""}](https://t.me/${process.env.BOT_USERNAME || ""})` }) +
                    "\n\n" +
                    text,
                parse_mode: "Markdown",
                link_preview_options: {
                    is_disabled: true
                }
            },
            reply_markup: {
                inline_keyboard: [[
                    { text: ctx.t("open_full_profile"), url: `t.me/${process.env.BOT_USERNAME}?start=profile_${encodeId(userId)}` }
                ]]
            }
        }];

        await ctx.answerInlineQuery(results, { cache_time: 0 });
        ctx.logger.info({ userId }, 'Inline query answered successfully');
    } catch (error) {
        ctx.logger.error({ 
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, 'Error in inline query');
        
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