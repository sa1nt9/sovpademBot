import { User } from "@prisma/client";
import { prisma } from "../../db/postgres";
import { MyContext } from "../../typescript/context";

export async function getCandidate(ctx: MyContext) {
    try {
        const userId = String(ctx.message?.from.id);

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (user) {
            const now = new Date();
            const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

            const candidates: User[] = await prisma.$queryRaw`
                WITH RankedUsers AS (
                    SELECT *,
                        6371 * acos(
                            cos(radians(${user.latitude})) * cos(radians("latitude")) *
                            cos(radians("longitude") - radians(${user.longitude})) +
                            sin(radians(${user.latitude})) * sin(radians("latitude"))
                        ) as distance,
                        CASE WHEN ${user.ownCoordinates} IS TRUE AND "ownCoordinates" IS TRUE THEN 1 ELSE 0 END as ownCoordSort,
                        CAST(
                            (
                                SELECT COUNT(*) 
                                FROM "User" as refs 
                                WHERE refs."referrerId" = "User"."id" 
                                AND refs."createdAt" >= ${fourteenDaysAgo}
                            ) AS INTEGER
                        ) as comeIn14Days,
                        CAST(
                            (
                                SELECT COUNT(*) 
                                FROM "User" as refs 
                                WHERE refs."referrerId" = "User"."id"
                            ) AS INTEGER
                        ) as comeInAll
                    FROM "User"
                    WHERE "id" <> ${userId}
                        AND "isActive" = true
                        AND "id" NOT IN (
                            SELECT "targetId" 
                            FROM "UserLike" 
                            WHERE "userId" = ${userId}
                            AND "createdAt" >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
                        )
                        AND "id" NOT IN (
                            SELECT "targetId"
                            FROM "Blacklist"
                            WHERE "userId" = ${userId}
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
                        AND ABS("age" - ${user.age}) <= 2
                )
                SELECT *,
                    LEAST(
                        comeIn14Days * 10 + (comeInAll - comeIn14Days) * 5,
                        100
                    ) as bonus
                FROM RankedUsers
                ORDER BY 
                    ownCoordSort DESC,
                    ROUND(distance * 100) / 100, 
                    bonus DESC
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
    } catch (error) {
        ctx.logger.error(error, 'Error getting candidate');
        return null;
    }
}