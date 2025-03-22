import { User } from "@prisma/client";
import { prisma } from "../../db/postgres";
import { MyContext } from "../../typescript/context";

export async function getRoulettePartner(ctx: MyContext): Promise<string | null> {
    try {
        const userId = String(ctx.from?.id);

        // Получаем информацию о текущем пользователе
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return null;
        }

        // Расчет периода для бонусных очков
        const now = new Date();
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        // Находим подходящего партнера, используя сложную сортировку
        const partners = await prisma.$queryRaw<Array<{ id: string; distance: number; score: number }>>`
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
                        WHEN (${user.interestedIn} = 'all' OR u."gender"::text = ${user.interestedIn}) AND
                             (u."interestedIn" = 'all' OR u."interestedIn"::text = ${user.gender})
                        THEN 25
                        WHEN ${user.interestedIn} = 'all' OR u."gender"::text = ${user.interestedIn}
                        THEN 15
                        WHEN u."interestedIn" = 'all' OR u."interestedIn"::text = ${user.gender}
                        THEN 15
                        ELSE 0
                    END as gender_bonus,
                    -- Бонус за активность (приведенные пользователи)
                    (
                        SELECT CAST(
                            (
                                SELECT COUNT(*) 
                                FROM "User" as refs 
                                WHERE refs."referrerId" = u."id" 
                                AND refs."createdAt" >= ${fourteenDaysAgo}
                            ) * 10 + 
                            (
                                SELECT COUNT(*) 
                                FROM "User" as refs 
                                WHERE refs."referrerId" = u."id" 
                                AND refs."createdAt" < ${fourteenDaysAgo}
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
                action: 'Found roulette partner',
                userId,
                partnerId: partner.id,
                distance: partner.distance,
                score: partner.score
            });
            
            return partner.id;
        }

        return null;
    } catch (error) {
        ctx.logger.error({
            error,
            action: 'Error finding roulette partner',
            userId: String(ctx.from?.id)
        });
        return null;
    }
}
