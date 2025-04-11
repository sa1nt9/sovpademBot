import { prisma } from "../db/postgres";
import { MyContext } from "../typescript/context";
import { format } from 'date-fns';

export const checkForBanMiddleware = async (ctx: MyContext, next: () => Promise<void>) => {
    if (ctx.inlineQuery) {
        await next();
        return;
    }

    const userId = String(ctx.from?.id);

    // Проверяем, есть ли активный бан для пользователя
    const now = new Date();
    const activeBan = await prisma.userBan.findFirst({
        where: {
            userId: userId,
            isActive: true,
            bannedUntil: {
                gt: now
            }
        }
    });

    if (activeBan) {
        const banEndDate = format(activeBan.bannedUntil, "d MMMM yyyy 'в' HH:mm");
        
        let banMessage = "";
        
        const isPermanent = activeBan.bannedUntil.getFullYear() > 2100;
        
        if (isPermanent) {
            banMessage += ctx.t("user_banned_permanent") + "\n\n";
        } else {
            banMessage += ctx.t("user_banned_until", { date: banEndDate }) + "\n\n";
        }
        
        if (activeBan.reason) {
            banMessage += "\n\n" + ctx.t("user_banned_reason", { reason: activeBan.reason });
        }
        
        await ctx.reply(banMessage);
        
        return; 
    }

    await next();
};