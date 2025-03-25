import { complainToUserKeyboard, profileKeyboard } from "../constants/keyboards";
import { continueSeeFormsKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { bot } from "../main";
import { MyContext } from "../typescript/context";
import { sendForm } from "./sendForm";

interface SendMutualSympathyAfterAnswerOptions {
    withoutSleepMenu?: boolean;
}

const defaultOptions: SendMutualSympathyAfterAnswerOptions = {
    withoutSleepMenu: false
}

export const sendMutualSympathyAfterAnswer = async (ctx: MyContext, options: SendMutualSympathyAfterAnswerOptions = defaultOptions) => {
    // Получаем данные пользователя, который поставил лайк
    const likedUser = await prisma.user.findUnique({
        where: {
            id: String(ctx.session.pendingMutualLikeUserId)
        }
    });

    if (likedUser) {
        const userLike = await prisma.userLike.findFirst({
            where: {
                userId: String(ctx.from?.id),
                targetId: likedUser.id,
                liked: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                privateNote: true
            }
        });

        // Отправляем анкету пользователя, который поставил лайк
        await sendForm(ctx, likedUser, { myForm: false, privateNote: userLike?.privateNote });

        ctx.session.step = 'continue_see_forms'

        const userInfo = await ctx.api.getChat(likedUser.id);

        await ctx.reply(`${ctx.t('mutual_sympathy')} [${likedUser.name}](https://t.me/${userInfo.username})`, {
            reply_markup: complainToUserKeyboard(ctx.t, String(likedUser.id)),
            parse_mode: 'Markdown',
        });

        if (!options.withoutSleepMenu) {
            ctx.session.step = 'sleep_menu'
            await ctx.reply(ctx.t('sleep_menu'), {
                reply_markup: profileKeyboard()
            });
        }

        ctx.session.pendingMutualLike = false;
        ctx.session.pendingMutualLikeUserId = undefined;
    }
}