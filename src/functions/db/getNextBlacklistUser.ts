import { prisma } from "../../db/postgres";
import { MyContext } from "../../typescript/context";

export const getNextBlacklistUser = async (ctx: MyContext, currentTargetId: string) => {
    const userId = String(ctx.from?.id) 

    try {
        // Сначала получаем время создания текущей записи
        const currentRecord = await prisma.blacklist.findFirst({
            where: {
                userId,
                targetId: currentTargetId
            },
            select: {
                createdAt: true
            }
        });

        if (!currentRecord) {
            return {
                user: null,
                remainingCount: 0
            };
        }

        // Получаем следующего пользователя и общее количество оставшихся
        const [nextUser, remainingCount] = await Promise.all([
            prisma.blacklist.findFirst({
                where: {
                    userId,
                    targetId: {
                        not: currentTargetId
                    },
                    createdAt: {
                        lt: currentRecord.createdAt
                    }
                },
                include: {
                    target: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.blacklist.count({
                where: {
                    userId,
                    createdAt: {
                        lt: currentRecord.createdAt
                    }
                }
            })
        ]);

        return {
            user: nextUser?.target || null,
            remainingCount
        };
    } catch (error) {
        console.error('Error getting next blacklist user:', error);
        return {
            user: null,
            remainingCount: 0
        };
    }
};
