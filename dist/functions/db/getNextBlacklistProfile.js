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
const getNextBlacklistProfile = (ctx, currentTargetProfileId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
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
            return {
                profile: null,
                remainingCount: 0
            };
        }
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
        let profile = null;
        if (nextUser === null || nextUser === void 0 ? void 0 : nextUser.targetProfileId) {
            profile = yield postgres_1.prisma[(0, profilesService_1.getProfileModelName)(nextUser.profileType || client_1.ProfileType.RELATIONSHIP)].findUnique({
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
    }
    catch (error) {
        console.error('Error getting next blacklist user:', error);
        return {
            profile: null,
            remainingCount: 0
        };
    }
});
exports.getNextBlacklistProfile = getNextBlacklistProfile;
