import { MyContext } from "../../typescript/context";
import { prisma } from "../../db/postgres";

export const toggleUserActive = async (ctx: MyContext, isActive: boolean) => {
    try {
        const userId = String(ctx.message?.from.id);
        
        // Сначала получаем текущего пользователя
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { isActive: true }
        });

        // Если статус не изменился, возвращаем текущего пользователя
        if (currentUser?.isActive === isActive) {
            return currentUser;
        }

        // Если статус отличается, обновляем
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isActive }
        });

        return updatedUser;
    } catch (error) {
        ctx.logger.error(error, 'Error toggling user active status');
        return null;
    }
} 