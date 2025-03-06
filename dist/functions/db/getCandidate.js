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
exports.getCandidate = getCandidate;
const postgres_1 = require("../../db/postgres");
function getCandidate(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
            const user = yield postgres_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (user) {
                const candidates = yield postgres_1.prisma.$queryRaw `
                WITH RankedUsers AS (
                    SELECT *,
                        6371 * acos(
                            cos(radians(${user.latitude})) * cos(radians("latitude")) *
                            cos(radians("longitude") - radians(${user.longitude})) +
                            sin(radians(${user.latitude})) * sin(radians("latitude"))
                        ) as distance
                    FROM "User"
                    WHERE "id" <> ${userId}
                        AND "isActive" = true
                        AND "id" NOT IN (
                            SELECT "targetId" FROM "UserLike" WHERE "userId" = ${userId}
                        )
                        AND (
                            CASE 
                                WHEN ${user.interestedIn} = 'all' THEN TRUE
                                ELSE "gender"::text = ${user.interestedIn}
                            END
                        )
                        AND (
                            CASE 
                                WHEN "interestedIn" = 'all' THEN TRUE
                                ELSE "interestedIn"::text = ${user.gender}
                            END
                        )
                )
                SELECT *
                FROM RankedUsers
                ORDER BY distance ASC
                LIMIT 1;
            `;
                const candidate = candidates[0];
                if (candidate) {
                    // Сохраняем кандидата в сессию
                    ctx.session.currentCandidate = candidate;
                }
                return candidate;
            }
            return null;
        }
        catch (error) {
            ctx.logger.error(error, 'Error getting candidate');
            return null;
        }
    });
}
