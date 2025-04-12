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
exports.getRoulettePartner = getRoulettePartner;
const postgres_1 = require("../../db/postgres");
function getRoulettePartner(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const userId = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
        ctx.logger.info({ userId }, 'Starting to search for roulette partner');
        try {
            // Получаем информацию о текущем пользователе
            const user = yield postgres_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                ctx.logger.warn({ userId }, 'User not found while searching for roulette partner');
                return null;
            }
            ctx.logger.info({
                userId,
                hasLocation: user.ownCoordinates,
                hasAge: !!user.age,
                gender: user.gender
            }, 'Found user data for roulette partner search');
            // Расчет периода для бонусных очков
            const now = new Date();
            const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
            ctx.logger.info({
                userId,
                periodStart: fifteenDaysAgo,
                periodEnd: now
            }, 'Calculating bonus points period');
            // Находим подходящего партнера, используя сложную сортировку
            const partners = yield postgres_1.prisma.$queryRaw `
            WITH RankedPartners AS (
                SELECT 
                    u.id,
                    ru.id as roulette_user_id,
                    -- Расчет расстояния между пользователями
                    6371 * acos(
                        cos(radians(COALESCE(${user.latitude}, 0))) * cos(radians(COALESCE(u."latitude", 0))) *
                        cos(radians(COALESCE(u."longitude", 0)) - radians(COALESCE(${user.longitude}, 0))) +
                        sin(radians(COALESCE(${user.latitude}, 0))) * sin(radians(COALESCE(u."latitude", 0)))
                    ) as distance,
                    -- Бонус если оба пользователя указали свои координаты
                    CASE WHEN ${user.ownCoordinates === true} AND u."ownCoordinates" IS TRUE THEN 20 ELSE 0 END as coord_bonus,
                    -- Бонус за близкий возраст (меньше разница - больше бонус)
                    CASE 
                        WHEN ABS(COALESCE(u."age", 0) - COALESCE(${user.age}, 0)) <= 1 THEN 15
                        WHEN ABS(COALESCE(u."age", 0) - COALESCE(${user.age}, 0)) <= 3 THEN 10
                        WHEN ABS(COALESCE(u."age", 0) - COALESCE(${user.age}, 0)) <= 5 THEN 5
                        ELSE 0
                    END as age_bonus,
                    -- Бонус за соответствие гендерных предпочтений
                    CASE 
                        WHEN u."gender"::text = ${user.gender}
                        THEN 0
                        ELSE 50
                    END as gender_bonus,
                    -- Бонус за активность (приведенные пользователи)
                    (
                        SELECT CAST(
                            (
                                SELECT COUNT(*) 
                                FROM "User" as refs 
                                WHERE refs."referrerId" = u."id" 
                                AND refs."createdAt" >= ${fifteenDaysAgo}
                            ) * 10 + 
                            (
                                SELECT COUNT(*) 
                                FROM "User" as refs 
                                WHERE refs."referrerId" = u."id" 
                                AND refs."createdAt" < ${fifteenDaysAgo}
                            ) * 5
                        AS INTEGER)
                    ) as referral_bonus
                FROM "User" u
                JOIN "RouletteUser" ru ON u.id = ru.id
                WHERE u.id <> ${userId}
                    AND ru."searchingPartner" = true
                    AND ru."chatPartnerId" IS NULL
            ),
            ScoredPartners AS (
                SELECT 
                    id,
                    distance,
                    coord_bonus,
                    age_bonus,
                    gender_bonus,
                    referral_bonus,
                    -- Бонус за близость (используем уже вычисленное расстояние)
                    CASE 
                        WHEN distance <= 5 THEN 30  -- 5 км и меньше
                        WHEN distance <= 15 THEN 20 -- от 5 до 15 км
                        WHEN distance <= 30 THEN 10 -- от 15 до 30 км
                        ELSE 0
                    END as distance_bonus
                FROM RankedPartners
            )
            SELECT 
                id,
                distance,
                -- Общий показатель соответствия для сортировки
                (coord_bonus + age_bonus + gender_bonus + distance_bonus + LEAST(referral_bonus, 40)) as score
            FROM ScoredPartners
            ORDER BY score DESC, distance ASC
            LIMIT 1;
        `;
            // Если найден подходящий партнер, возвращаем его ID
            if (partners && partners.length > 0) {
                const partner = partners[0];
                ctx.logger.info({
                    userId,
                    partnerId: partner.id,
                    distance: Math.round(partner.distance * 10) / 10,
                    score: partner.score
                }, 'Found suitable roulette partner');
                return partner.id;
            }
            ctx.logger.info({ userId }, 'No suitable roulette partner found');
            return null;
        }
        catch (error) {
            ctx.logger.error({
                userId,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            }, 'Error finding roulette partner');
            return null;
        }
    });
}
