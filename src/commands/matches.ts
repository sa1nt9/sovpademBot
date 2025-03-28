import { formDisabledKeyboard, notHaveFormToDeactiveKeyboard, profileKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { showRouletteStart } from "../messages/roulette_start";
import { MyContext } from "../typescript/context";
import { InlineKeyboard } from "grammy";
import { formatDate } from "../functions/formatDate";

export const matchesCommand = async (ctx: MyContext) => {
    const userId = String(ctx.message?.from.id);

    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (existingUser) {
        ctx.session.step = 'sleep_menu';

        // Получаем все взаимные симпатии пользователя
        const mutualLikes = await prisma.userLike.findMany({
            where: {
                userId: userId,
                liked: true,
                isMutual: true
            },
            include: {
                target: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 101
        });

        if (mutualLikes.length === 0) {
            ctx.session.step = 'form_disabled';

            await ctx.reply(ctx.t('no_matches'), {
                reply_markup: formDisabledKeyboard(ctx.t)
            });
            return;
        }

        let message = mutualLikes.length > 100 ? ctx.t('matches_message_last') : ctx.t('matches_message_all') + '\n\n';

        // Создаем inline клавиатуру с номерами
        const keyboard = new InlineKeyboard();
        const buttonsPerRow = 5;

        for (let i = 0; i < mutualLikes.length; i++) {
            const like = mutualLikes[i];
            const userInfo = await ctx.api.getChat(like.target.id);
            const username = `https://t.me/${userInfo.username}`;

            message += `${i + 1}. [${like.target.name}](${username}) - ${formatDate(like.isMutualAt || like.createdAt)}\n`;

            if (i % buttonsPerRow === 0 && i !== 0) {
                keyboard.row();
            }
            keyboard.text(`${i + 1}. ${like.target.name}`, `match:${like.target.id}`);
        }

        message += `\n${ctx.t('matches_message_choose')}`;

        await ctx.reply(message, {
            parse_mode: 'Markdown',
            link_preview_options: {
                is_disabled: true
            },
            reply_markup: keyboard
        });

        await ctx.reply(ctx.t('sleep_menu'), {
            reply_markup: profileKeyboard()
        });

    } else {
        ctx.session.step = "you_dont_have_form";

        await ctx.reply(ctx.t('you_dont_have_form'), {
            reply_markup: notHaveFormToDeactiveKeyboard(ctx.t)
        })
    }
}
