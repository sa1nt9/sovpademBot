import { blacklistKeyboard, profileKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { sendForm } from "../functions/sendForm";
import { MyContext } from "../typescript/context";

export const blacklistCommand = async (ctx: MyContext) => {
    const userId = String(ctx.message?.from.id);

    try {
        // Получаем первую запись и общее количество
        const [blacklistedUser, totalCount] = await Promise.all([
            prisma.blacklist.findFirst({
                where: { userId },
                include: {
                    target: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.blacklist.count({
                where: { userId }
            })
        ]);

        if (!blacklistedUser) {
            // Если черный список пуст
            await ctx.reply(ctx.t('blacklist_empty'));

            await ctx.reply(ctx.t('sleep_menu'), {
                reply_markup: profileKeyboard()
            });

            return;
        }

        ctx.session.step = "blacklist_user";

        await ctx.reply("🚫📋", {
            reply_markup: blacklistKeyboard(ctx.t)
        });

        // Показываем запись из черного списка
        await sendForm(ctx, blacklistedUser.target, { 
            myForm: false, 
            isBlacklist: true, 
            blacklistCount: totalCount - 1
        });


        // Сохраняем текущего пользователя из черного списка в сессию
        ctx.session.currentBlacklistedUser = blacklistedUser.target;

    } catch (error) {
        ctx.logger.error(error, 'Error in blacklist command');
        await ctx.reply(ctx.t('error_occurred'));
    }
};