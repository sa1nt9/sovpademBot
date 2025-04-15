"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextBlacklistProfile = void 0;
const client_1 = require("@prisma/client");
const postgres_1 = require("../../db/postgres");
const profilesService_1 = require("./profilesService");
const logger_1 = require("../../logger");
const getNextBlacklistProfile = (ctx, currentTargetProfileId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
    logger_1.logger.info({
        userId,
        currentTargetProfileId
    }, 'Getting next blacklist profile');
    try {
        // Сначала получаем время создания текущей записи
        const currentRecord = yield postgres_1.prisma.blacklist.findFirst({
            where: {
                userId,
                targetProfileId: currentTargetProfileId
            },
            select: {
                createdAt: true
            }
        });
        if (!currentRecord) {
            logger_1.logger.warn({
                userId,
                currentTargetProfileId
            }, 'Current blacklist record not found');
            return {
                profile: null,
                remainingCount: 0
            };
        }
        logger_1.logger.info({
            userId,
            currentTargetProfileId,
            currentRecordDate: currentRecord.createdAt
        }, 'Found current blacklist record');
        // Получаем следующего пользователя и общее количество оставшихся
        const [nextUser, remainingCount] = yield Promise.all([
            postgres_1.prisma.blacklist.findFirst({
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
            postgres_1.prisma.blacklist.count({
                where: {
                    userId,
                    createdAt: {
                        lt: currentRecord.createdAt
                    }
                }
            })
        ]);
        logger_1.logger.info({
            userId,
            hasNextUser: !!nextUser,
            remainingCount
        }, 'Retrieved next user and remaining count');
        let profile = null;
        if (nextUser === null || nextUser === void 0 ? void 0 : nextUser.targetProfileId) {
            logger_1.logger.info({
                userId,
                targetProfileId: nextUser.targetProfileId,
                profileType: nextUser.profileType
            }, 'Fetching profile details for next blacklist user');
            profile = yield postgres_1.prisma[(0, profilesService_1.getProfileModelName)(nextUser.profileType || client_1.ProfileType.RELATIONSHIP)].findUnique({
                where: { id: nextUser.targetProfileId },
                include: {
                    user: true
                }
            });
            if (profile) {
                logger_1.logger.info({
                    userId,
                    targetProfileId: nextUser.targetProfileId
                }, 'Found profile details for next blacklist user');
            }
            else {
                logger_1.logger.warn({
                    userId,
                    targetProfileId: nextUser.targetProfileId
                }, 'Profile not found for next blacklist user');
            }
        }
        return {
            profile: profile || null,
            remainingCount
        };
    }
    catch (error) {
        logger_1.logger.error({
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
});
exports.getNextBlacklistProfile = getNextBlacklistProfile;
