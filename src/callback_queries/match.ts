import { prisma } from "../db/postgres";
import { sendForm } from "../functions/sendForm";
import { formDisabledKeyboard, mainMenuKeyboard } from "../constants/keyboards";
import { MyContext } from "../typescript/context";

export const matchCallbackQuery = async (ctx: MyContext) => {
    const callbackQuery = ctx.callbackQuery!;
    const callbackData = callbackQuery.data || "";
    const targetUserId = callbackData.split(":")[1];

    const targetUser = await prisma.user.findUnique({
        where: {
            id: targetUserId,
            isActive: true
        }
    });

    if (!targetUser) {
        await ctx.answerCallbackQuery({
            text: ctx.t('user_not_found'),
            show_alert: true
        });
        return;
    }

    const userInfo = await ctx.api.getChat(targetUser.id);
    const username = `https://t.me/${userInfo.username}`;

    const text = ctx.t('match_selected', { user: `[${targetUser.name}](${username})` });

    ctx.session.step = 'go_main_menu';

    await ctx.answerCallbackQuery({
        text: ctx.t('match_you_select', { user: targetUser.name }),
        show_alert: false,
    });

    await ctx.reply(text, {
        parse_mode: 'Markdown',
        reply_markup: mainMenuKeyboard(ctx.t),
        link_preview_options: {
            is_disabled: true
        }
    });

    await sendForm(ctx, targetUser, { myForm: false });
} 