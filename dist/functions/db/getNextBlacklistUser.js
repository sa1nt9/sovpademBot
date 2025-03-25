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
exports.getNextBlacklistUser = void 0;
const postgres_1 = require("../../db/postgres");
const getNextBlacklistUser = (ctx, currentTargetId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
    try {
        // Сначала получаем время создания текущей записи
        const currentRecord = yield postgres_1.prisma.blacklist.findFirst({
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
        const [nextUser, remainingCount] = yield Promise.all([
            postgres_1.prisma.blacklist.findFirst({
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
            postgres_1.prisma.blacklist.count({
                where: {
                    userId,
                    createdAt: {
                        lt: currentRecord.createdAt
                    }
                }
            })
        ]);
        return {
            user: (nextUser === null || nextUser === void 0 ? void 0 : nextUser.target) || null,
            remainingCount
        };
    }
    catch (error) {
        console.error('Error getting next blacklist user:', error);
        return {
            user: null,
            remainingCount: 0
        };
    }
});
exports.getNextBlacklistUser = getNextBlacklistUser;
