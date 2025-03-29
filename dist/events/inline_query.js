"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inlineQueryEvent = void 0;
const postgres_1 = require("../db/postgres");
const sendForm_1 = require("../functions/sendForm");
const encodeId_1 = require("../functions/encodeId");
const inlineQueryEvent = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = String(ctx.from.id);
    try {
        const user = yield postgres_1.prisma.user.findUnique({
            where: {
                id: userId,
                isActive: true
            }
        });
        if (!user) {
            yield ctx.answerInlineQuery([{
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
        const text = yield (0, sendForm_1.buildTextForm)(ctx, user, { isInline: true });
        const results = [{
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
                            { text: ctx.t("open_full_profile"), url: `t.me/${process.env.BOT_USERNAME}?start=profile_${(0, encodeId_1.encodeId)(userId)}` }
                        ]]
                }
            }];
        yield ctx.answerInlineQuery(results, { cache_time: 0 });
    }
    catch (error) {
        console.error("Error in inline query:", error);
        yield ctx.answerInlineQuery([{
                type: "article",
                id: "error",
                title: ctx.t("error_occurred"),
                description: ctx.t("error_occurred_description"),
                input_message_content: {
                    message_text: ctx.t("error_occurred_description")
                }
            }], { cache_time: 0 });
    }
});
exports.inlineQueryEvent = inlineQueryEvent;
