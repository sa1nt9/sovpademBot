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
            const candidates: User[] = await prisma.$queryRaw`
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
    } catch (error) {
        ctx.logger.error(error, 'Error getting candidate');
        return null;
    }
}
