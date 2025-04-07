import { blacklistKeyboard, profileKeyboard } from "../constants/keyboards";
import { prisma } from "../db/postgres";
import { sendForm } from "../functions/sendForm";
import { MyContext } from "../typescript/context";
import { ProfileType } from "@prisma/client";
import { IProfile } from "../typescript/interfaces/IProfile";
import { getProfileModelName } from "../functions/db/profilesService";

export const blacklistCommand = async (ctx: MyContext) => {
    const userId = String(ctx.message?.from.id);

    try {
        // Получаем первую запись и общее количество
        const [blacklistedProfile, totalCount] = await Promise.all([
            prisma.blacklist.findFirst({
                where: { userId },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.blacklist.count({
                where: { userId }
            })
        ]);

        if (!blacklistedProfile) {
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
        
        // Проверяем все возможные типы профилей
        const profile: IProfile = await (prisma as any)[getProfileModelName(blacklistedProfile.profileType)].findUnique({
            where: { id: blacklistedProfile.targetProfileId }
        });
        
        // Получаем пользователя для этого профиля
        const user = await prisma.user.findUnique({
            where: { id: profile.userId }
        });
        
        if (!user) {
            await ctx.reply(ctx.t('profile_not_found'));
            return;
        }

        // Показываем запись из черного списка
        await sendForm(ctx, user, { 
            myForm: false, 
            isBlacklist: true, 
            blacklistCount: totalCount - 1,
            profileType: blacklistedProfile.profileType,
            subType: (blacklistedProfile as any).subType || ""
        });

        // Сохраняем текущий профиль из черного списка в сессию
        ctx.session.currentBlacklistedProfile = profile;

    } catch (error) {
        ctx.logger.error(error, 'Error in blacklist command');
        await ctx.reply(ctx.t('error_occurred'));
    }
};