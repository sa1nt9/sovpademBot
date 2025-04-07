import { ProfileType } from "@prisma/client";
import { prisma } from "../../db/postgres";
import { MyContext } from "../../typescript/context";
import { IProfile } from "../../typescript/interfaces/IProfile";
import { getProfileModelName } from "./profilesService";

export const getNextBlacklistProfile = async (ctx: MyContext, currentTargetProfileId: string) => {
    const userId = String(ctx.from?.id) 

    try {
        // Сначала получаем время создания текущей записи
        const currentRecord = await prisma.blacklist.findFirst({
            where: {
                userId,
                targetProfileId: currentTargetProfileId
            },
            select: {
                createdAt: true
            }
        });

        if (!currentRecord) {
            return {
                profile: null,
                remainingCount: 0
            };
        }

        // Получаем следующего пользователя и общее количество оставшихся
        const [nextUser, remainingCount] = await Promise.all([
            prisma.blacklist.findFirst({
                where: {
                    userId,
                    targetProfileId: {
                        not: currentTargetProfileId
                    },
                    createdAt: {
                        lt: currentRecord.createdAt
                    }
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

        let profile: IProfile | null = null;

        if (nextUser?.targetProfileId) {
            profile = await (prisma as any)[getProfileModelName(nextUser.profileType || ProfileType.RELATIONSHIP)].findUnique({
                where: { id: nextUser.targetProfileId },
                include: {
                    user: true
                }
            }); 
        }

        return {
            profile: profile || null,
            remainingCount
        };
    } catch (error) {
        console.error('Error getting next blacklist user:', error);
        return {
            profile: null,
            remainingCount: 0
        };
    }
};
