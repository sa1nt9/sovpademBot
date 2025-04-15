"use strict";var __awaiter=this&&this.__awaiter||function(e,r,n,t){return new(n||(n=Promise))((function(o,s){function a(e){try{u(t.next(e))}catch(e){s(e)}}function i(e){try{u(t.throw(e))}catch(e){s(e)}}function u(e){var r;e.done?o(e.value):(r=e.value,r instanceof n?r:new n((function(e){e(r)}))).then(a,i)}u((t=t.apply(e,r||[])).next())}))};Object.defineProperty(exports,"__esModule",{value:!0}),exports.getRoulettePartner=getRoulettePartner;const postgres_1=require("../../db/postgres");function getRoulettePartner(e){return __awaiter(this,void 0,void 0,(function*(){var r;const n=String(null===(r=e.from)||void 0===r?void 0:r.id);e.logger.info({userId:n},"Starting to search for roulette partner");try{const r=yield postgres_1.prisma.user.findUnique({where:{id:n}});if(!r)return e.logger.warn({userId:n},"User not found while searching for roulette partner"),null;e.logger.info({userId:n,hasLocation:r.ownCoordinates,hasAge:!!r.age,gender:r.gender},"Found user data for roulette partner search");const t=new Date,o=new Date(t.getTime()-1296e6);e.logger.info({userId:n,periodStart:o,periodEnd:t},"Calculating bonus points period");const s=yield postgres_1.prisma.$queryRaw`
            WITH RankedPartners AS (
                SELECT 
                    u.id,
                    ru.id as roulette_user_id,
                    -- Расчет расстояния между пользователями
                    6371 * acos(
                        cos(radians(COALESCE(${r.latitude}, 0))) * cos(radians(COALESCE(u."latitude", 0))) *
                        cos(radians(COALESCE(u."longitude", 0)) - radians(COALESCE(${r.longitude}, 0))) +
                        sin(radians(COALESCE(${r.latitude}, 0))) * sin(radians(COALESCE(u."latitude", 0)))
                    ) as distance,
                    -- Бонус если оба пользователя указали свои координаты
                    CASE WHEN ${!0===r.ownCoordinates} AND u."ownCoordinates" IS TRUE THEN 20 ELSE 0 END as coord_bonus,
                    -- Бонус за близкий возраст (меньше разница - больше бонус)
                    CASE 
                        WHEN ABS(COALESCE(u."age", 0) - COALESCE(${r.age}, 0)) <= 1 THEN 15
                        WHEN ABS(COALESCE(u."age", 0) - COALESCE(${r.age}, 0)) <= 3 THEN 10
                        WHEN ABS(COALESCE(u."age", 0) - COALESCE(${r.age}, 0)) <= 5 THEN 5
                        ELSE 0
                    END as age_bonus,
                    -- Бонус за соответствие гендерных предпочтений
                    CASE 
                        WHEN u."gender"::text = ${r.gender}
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
                                AND refs."createdAt" >= ${o}
                            ) * 10 + 
                            (
                                SELECT COUNT(*) 
                                FROM "User" as refs 
                                WHERE refs."referrerId" = u."id" 
                                AND refs."createdAt" < ${o}
                            ) * 5
                        AS INTEGER)
                    ) as referral_bonus
                FROM "User" u
                JOIN "RouletteUser" ru ON u.id = ru.id
                WHERE u.id <> ${n}
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
        `;if(s&&s.length>0){const r=s[0];return e.logger.info({userId:n,partnerId:r.id,distance:Math.round(10*r.distance)/10,score:r.score},"Found suitable roulette partner"),r.id}return e.logger.info({userId:n},"No suitable roulette partner found"),null}catch(r){return e.logger.error({userId:n,error:r instanceof Error?r.message:"Unknown error",stack:r instanceof Error?r.stack:void 0},"Error finding roulette partner"),null}}))}