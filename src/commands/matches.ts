import { formDisabledKeyboard, notHaveFormToDeactiveKeyboard, profileKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { showRouletteStart } from "../messages/roulette_start";
import { MyContext } from "../typescript/context";
import { InlineKeyboard } from "grammy";
import { formatDate } from "../functions/formatDate";
import { ProfileType } from "@prisma/client";
import { getProfileModelName } from "../functions/db/profilesService";


export const matchesCommand = async (ctx: MyContext) => {
    const userId = String(ctx.message?.from.id);

    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (existingUser) {
        ctx.session.step = 'sleep_menu';

        // Определяем текущий тип профиля из сессии
        const profileType = ctx.session.activeProfile.profileType || ProfileType.RELATIONSHIP;
        
        // Получаем модель для типа профиля
        const profileModel = getProfileModelName(profileType);
        
        // Получаем ID активного профиля на основе типа профиля
        const profile = await (prisma as any)[profileModel].findFirst({
            where: { userId }
        });
        
        const activeProfileId = profile?.id || "";
        
        if (!activeProfileId) {
            await ctx.reply(ctx.t('no_active_profile'));
            return;
        }

        // Получаем все взаимные симпатии для активного профиля
        const mutualLikes = await prisma.profileLike.findMany({
            where: {
                fromProfileId: activeProfileId,
                fromProfileType: profileType,
                liked: true,
                isMutual: true
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
            
            // Получаем модель для целевого профиля
            const targetProfileModel = getProfileModelName(like.toProfileType);
            
            // Получаем данные пользователя на основе ID профиля
            try {
                // Находим профиль пользователя с включением данных о пользователе
                const targetProfile = await (prisma as any)[targetProfileModel].findUnique({
                    where: { id: like.toProfileId },
                    include: { user: true }
                });
                
                if (!targetProfile || !targetProfile.user) continue;
                
                const targetUserId = targetProfile.user.id;
                const targetName = targetProfile.user.name;
                
                const userInfo = await ctx.api.getChat(targetUserId);
                const username = userInfo.username ? `https://t.me/${userInfo.username}` : "";

                message += `${i + 1}. [${targetName}](${username}) - ${formatDate(like.isMutualAt || like.createdAt)}\n`;

                if (i % buttonsPerRow === 0 && i !== 0) {
                    keyboard.row();
                }
                keyboard.text(`${i + 1}. ${targetName}`, `match:${targetUserId}`);
            } catch (e) {
                ctx.logger.error({ message: "Error retrieving profile or chat data:", error: e });
                continue;
            }
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
