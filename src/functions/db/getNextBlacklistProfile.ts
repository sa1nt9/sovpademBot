import { ProfileType } from "@prisma/client";
import { prisma } from "../../db/postgres";
import { MyContext } from "../../typescript/context";
import { IProfile } from "../../typescript/interfaces/IProfile";
import { getProfileModelName } from "./profilesService";
import { logger } from "../../logger";

export const getNextBlacklistProfile = async (ctx: MyContext, currentTargetProfileId: string) => {
    const userId = String(ctx.from?.id);
    
    logger.info({ 
        userId, 
        currentTargetProfileId 
    }, 'Getting next blacklist profile');

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
            logger.warn({ 
                userId, 
                currentTargetProfileId 
            }, 'Current blacklist record not found');
            return {
                profile: null,
                remainingCount: 0
            };
        }

        logger.info({ 
            userId, 
            currentTargetProfileId,
            currentRecordDate: currentRecord.createdAt
        }, 'Found current blacklist record');

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

        logger.info({ 
            userId,
            hasNextUser: !!nextUser,
            remainingCount
        }, 'Retrieved next user and remaining count');

        let profile: IProfile | null = null;

        if (nextUser?.targetProfileId) {
            logger.info({ 
                userId,
                targetProfileId: nextUser.targetProfileId,
                profileType: nextUser.profileType
            }, 'Fetching profile details for next blacklist user');

            profile = await (prisma as any)[getProfileModelName(nextUser.profileType || ProfileType.RELATIONSHIP)].findUnique({
                where: { id: nextUser.targetProfileId },
                include: {
                    user: true
                }
            }); 

            if (profile) {
                logger.info({ 
                    userId,
                    targetProfileId: nextUser.targetProfileId
                }, 'Found profile details for next blacklist user');
            } else {
                logger.warn({ 
                    userId,
                    targetProfileId: nextUser.targetProfileId
                }, 'Profile not found for next blacklist user');
            }
        }

        return {
            profile: profile || null,
            remainingCount
        };
    } catch (error) {
        logger.error({ 
            userId,
            currentTargetProfileId,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, 'Error getting next blacklist profile');
        return {
            profile: null,
            remainingCount: 0
        };
    }
};
