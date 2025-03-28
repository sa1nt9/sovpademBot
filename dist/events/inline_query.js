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
const inlineQueryEvent = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = String(ctx.from.id);
    try {
        // Получаем анкету пользователя
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
                        message_text: ctx.t("no_profile_message", { botname: process.env.BOT_USERNAME || "" })
                    }
                }], { cache_time: 0 });
            return;
        }
        const text = yield (0, sendForm_1.buildTextForm)(ctx, user, { isInline: true });
        // Получаем все фото пользователя
        let mediaGroup = [];
        if (user.files) {
            try {
                mediaGroup = JSON.parse(user.files);
            }
            catch (error) {
                console.error("Error parsing files:", error);
            }
        }
        console.log(mediaGroup);
        const results = [];
        // Добавляем фото
        if (mediaGroup.length > 0) {
            results.push({
                type: mediaGroup[0].type,
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
