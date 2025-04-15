"use strict";var __awaiter=this&&this.__awaiter||function(e,r,i,t){return new(i||(i=Promise))((function(n,s){function d(e){try{o(t.next(e))}catch(e){s(e)}}function a(e){try{o(t.throw(e))}catch(e){s(e)}}function o(e){var r;e.done?n(e.value):(r=e.value,r instanceof i?r:new i((function(e){e(r)}))).then(d,a)}o((t=t.apply(e,r||[])).next())}))};Object.defineProperty(exports,"__esModule",{value:!0}),exports.getCandidate=getCandidate;const client_1=require("@prisma/client"),postgres_1=require("../../db/postgres"),profilesService_1=require("./profilesService");function getRelationshipCandidate(e,r,i){return __awaiter(this,void 0,void 0,(function*(){return(yield postgres_1.prisma.$queryRaw`
        WITH RankedUsers AS (
            SELECT u.*,
                6371 * acos(
                    cos(radians(${e.latitude})) * cos(radians("latitude")) *
                    cos(radians("longitude") - radians(${e.longitude})) +
                    sin(radians(${e.latitude})) * sin(radians("latitude"))
                ) as distance,
                CASE WHEN ${e.ownCoordinates} IS TRUE AND "ownCoordinates" IS TRUE THEN 1 ELSE 0 END as ownCoordSort,
                CAST(
                    (
                        SELECT COUNT(*) 
                        FROM "User" as refs 
                        WHERE refs."referrerId" = u."id" 
                        AND refs."createdAt" >= ${i}
                    ) AS INTEGER
                ) as comeIn15Days,
                CAST(
                    (
                        SELECT COUNT(*) 
                        FROM "User" as refs 
                        WHERE refs."referrerId" = u."id"
                    ) AS INTEGER
                ) as comeInAll
            FROM "User" u
            WHERE "id" <> ${e.id}
                AND "id" NOT IN (
                    SELECT rp."userId"
                    FROM "ProfileLike" pl
                    JOIN "RelationshipProfile" rp ON rp."id" = pl."toProfileId"
                    WHERE pl."fromProfileId" IN (
                        SELECT "id" FROM "RelationshipProfile" WHERE "userId" = ${e.id}
                    )
                    AND pl."createdAt" >= ${new Date(Date.now()-2592e6)}
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM "Blacklist" b
                    WHERE b."userId" = ${e.id}
                    AND b."targetProfileId" IN (
                        SELECT "id"
                        FROM "RelationshipProfile"
                        WHERE "userId" = u."id"
                        AND "isActive" = true
                    )
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM "UserBan" ub
                    WHERE ub."userId" = u."id"
                    AND ub."isActive" = true
                    AND ub."bannedUntil" > ${new Date}
                )
                AND ABS("age" - ${e.age}) <= 2
                AND EXISTS (
                    SELECT 1 FROM "RelationshipProfile" rp
                    WHERE rp."userId" = u."id"
                    AND rp."isActive" = true
                    AND (
                        rp."interestedIn" = 'all'
                        OR (rp."interestedIn" = 'male' AND ${e.gender} = 'male')
                        OR (rp."interestedIn" = 'female' AND ${e.gender} = 'female')
                    )
                )
                AND (
                    ${r.interestedIn} = 'all'
                    OR (${r.interestedIn} = 'male' AND u."gender" = 'male')
                    OR (${r.interestedIn} = 'female' AND u."gender" = 'female')
                )
        )
        SELECT *,
            LEAST(
                comeIn15Days * 10 + (comeInAll - comeIn15Days) * 5,
                100
            ) as totalBonus
        FROM RankedUsers
        ORDER BY 
            ownCoordSort DESC,
            ROUND(distance * 100) / 100, 
            totalBonus DESC
        LIMIT 1;
    `)[0]}))}function getSportCandidate(e,r,i){return __awaiter(this,void 0,void 0,(function*(){const t=String(r.subType);return(yield postgres_1.prisma.$queryRaw`
        WITH RankedUsers AS (
            SELECT u.*,
                6371 * acos(
                    cos(radians(${e.latitude})) * cos(radians("latitude")) *
                    cos(radians("longitude") - radians(${e.longitude})) +
                    sin(radians(${e.latitude})) * sin(radians("latitude"))
                ) as distance,
                CASE WHEN ${e.ownCoordinates} IS TRUE AND "ownCoordinates" IS TRUE THEN 1 ELSE 0 END as ownCoordSort,
                CAST(
                    (
                        SELECT COUNT(*) 
                        FROM "User" as refs 
                        WHERE refs."referrerId" = u."id" 
                        AND refs."createdAt" >= ${i}
                    ) AS INTEGER
                ) as comeIn15Days,
                CAST(
                    (
                        SELECT COUNT(*) 
                        FROM "User" as refs 
                        WHERE refs."referrerId" = u."id"
                    ) AS INTEGER
                ) as comeInAll
            FROM "User" u
            WHERE "id" <> ${e.id}
                AND "id" NOT IN (
                    SELECT sp."userId"
                    FROM "ProfileLike" pl
                    JOIN "SportProfile" sp ON sp."id" = pl."toProfileId"
                    WHERE pl."fromProfileId" IN (
                        SELECT "id" FROM "SportProfile" WHERE "userId" = ${e.id} AND "subType"::text = ${t}
                    )
                    AND pl."createdAt" >= ${new Date(Date.now()-2592e6)}
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM "Blacklist" b
                    WHERE b."userId" = ${e.id}
                    AND b."targetProfileId" IN (
                        SELECT "id"
                        FROM "SportProfile"
                        WHERE "userId" = u."id"
                        AND "isActive" = true
                    )
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM "UserBan" ub
                    WHERE ub."userId" = u."id"
                    AND ub."isActive" = true
                    AND ub."bannedUntil" > ${new Date}
                )
                AND ABS("age" - ${e.age}) <= 2
                AND EXISTS (
                    SELECT 1 FROM "SportProfile" sp
                    WHERE sp."userId" = u."id"
                    AND sp."isActive" = true
                    AND sp."subType"::text = ${t}
                    AND (
                        sp."interestedIn" = 'all'
                        OR (sp."interestedIn" = 'male' AND ${e.gender} = 'male')
                        OR (sp."interestedIn" = 'female' AND ${e.gender} = 'female')
                    )
                )
                AND (
                    ${r.interestedIn} = 'all'
                    OR (${r.interestedIn} = 'male' AND u."gender" = 'male')
                    OR (${r.interestedIn} = 'female' AND u."gender" = 'female')
                )
        )
        SELECT *,
            LEAST(
                comeIn15Days * 10 + (comeInAll - comeIn15Days) * 5,
                100
            ) + 
            CASE 
                WHEN EXISTS (
                    SELECT 1 FROM "SportProfile" sp
                    WHERE sp."userId" = u."id"
                    AND sp."isActive" = true
                    AND sp."subType"::text = ${t}
                    AND sp."level" = ${r.level}
                ) THEN 50
                ELSE 0
            END as totalBonus
        FROM RankedUsers u
        ORDER BY 
            ownCoordSort DESC,
            ROUND(distance * 100) / 100, 
            totalBonus DESC
        LIMIT 1;
    `)[0]}))}function getGameCandidate(e,r,i){return __awaiter(this,void 0,void 0,(function*(){const t=String(r.subType);return(yield postgres_1.prisma.$queryRaw`
        WITH RankedUsers AS (
            SELECT u.*,
                6371 * acos(
                    cos(radians(${e.latitude})) * cos(radians("latitude")) *
                    cos(radians("longitude") - radians(${e.longitude})) +
                    sin(radians(${e.latitude})) * sin(radians("latitude"))
                ) as distance,
                CASE WHEN ${e.ownCoordinates} IS TRUE AND "ownCoordinates" IS TRUE THEN 1 ELSE 0 END as ownCoordSort,
                CAST(
                    (
                        SELECT COUNT(*) 
                        FROM "User" as refs 
                        WHERE refs."referrerId" = u."id" 
                        AND refs."createdAt" >= ${i}
                    ) AS INTEGER
                ) as comeIn15Days,
                CAST(
                    (
                        SELECT COUNT(*) 
                        FROM "User" as refs 
                        WHERE refs."referrerId" = u."id"
                    ) AS INTEGER
                ) as comeInAll
            FROM "User" u
            WHERE "id" <> ${e.id}
                AND "id" NOT IN (
                    SELECT gp."userId"
                    FROM "ProfileLike" pl
                    JOIN "GameProfile" gp ON gp."id" = pl."toProfileId"
                    WHERE pl."fromProfileId" IN (
                        SELECT "id" FROM "GameProfile" WHERE "userId" = ${e.id} AND "subType"::text = ${t}
                    )
                    AND pl."createdAt" >= ${new Date(Date.now()-2592e6)}
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM "Blacklist" b
                    WHERE b."userId" = ${e.id}
                    AND b."targetProfileId" IN (
                        SELECT "id"
                        FROM "GameProfile"
                        WHERE "userId" = u."id"
                        AND "isActive" = true
                    )
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM "UserBan" ub
                    WHERE ub."userId" = u."id"
                    AND ub."isActive" = true
                    AND ub."bannedUntil" > ${new Date}
                )
                AND ABS("age" - ${e.age}) <= 2
                AND EXISTS (
                    SELECT 1 FROM "GameProfile" gp
                    WHERE gp."userId" = u."id"
                    AND gp."isActive" = true
                    AND gp."subType"::text = ${t}
                    AND (
                        gp."interestedIn" = 'all'
                        OR (gp."interestedIn" = 'male' AND ${e.gender} = 'male')
                        OR (gp."interestedIn" = 'female' AND ${e.gender} = 'female')
                    )
                )
                AND (
                    ${r.interestedIn} = 'all'
                    OR (${r.interestedIn} = 'male' AND u."gender" = 'male')
                    OR (${r.interestedIn} = 'female' AND u."gender" = 'female')
                )
        )
        SELECT *,
            LEAST(
                comeIn15Days * 10 + (comeInAll - comeIn15Days) * 5,
                100
            ) as totalBonus
        FROM RankedUsers
        ORDER BY 
            ownCoordSort DESC,
            ROUND(distance * 100) / 100, 
            totalBonus DESC
        LIMIT 1;
    `)[0]}))}function getHobbyCandidate(e,r,i){return __awaiter(this,void 0,void 0,(function*(){const t=String(r.subType);return(yield postgres_1.prisma.$queryRaw`
        WITH RankedUsers AS (
            SELECT u.*,
                6371 * acos(
                    cos(radians(${e.latitude})) * cos(radians("latitude")) *
                    cos(radians("longitude") - radians(${e.longitude})) +
                    sin(radians(${e.latitude})) * sin(radians("latitude"))
                ) as distance,
                CASE WHEN ${e.ownCoordinates} IS TRUE AND "ownCoordinates" IS TRUE THEN 1 ELSE 0 END as ownCoordSort,
                CAST(
                    (
                        SELECT COUNT(*) 
                        FROM "User" as refs 
                        WHERE refs."referrerId" = u."id" 
                        AND refs."createdAt" >= ${i}
                    ) AS INTEGER
                ) as comeIn15Days,
                CAST(
                    (
                        SELECT COUNT(*) 
                        FROM "User" as refs 
                        WHERE refs."referrerId" = u."id"
                    ) AS INTEGER
                ) as comeInAll
            FROM "User" u
            WHERE "id" <> ${e.id}
                AND "id" NOT IN (
                    SELECT hp."userId"
                    FROM "ProfileLike" pl
                    JOIN "HobbyProfile" hp ON hp."id" = pl."toProfileId"
                    WHERE pl."fromProfileId" IN (
                        SELECT "id" FROM "HobbyProfile" WHERE "userId" = ${e.id} AND "subType"::text = ${t}
                    )
                    AND pl."createdAt" >= ${new Date(Date.now()-2592e6)}
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM "Blacklist" b
                    WHERE b."userId" = ${e.id}
                    AND b."targetProfileId" IN (
                        SELECT "id"
                        FROM "HobbyProfile"
                        WHERE "userId" = u."id"
                        AND "isActive" = true
                    )
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM "UserBan" ub
                    WHERE ub."userId" = u."id"
                    AND ub."isActive" = true
                    AND ub."bannedUntil" > ${new Date}
                )
                AND ABS("age" - ${e.age}) <= 2
                AND EXISTS (
                    SELECT 1 FROM "HobbyProfile" hp
                    WHERE hp."userId" = u."id"
                    AND hp."isActive" = true
                    AND hp."subType"::text = ${t}
                    AND (
                        hp."interestedIn" = 'all'
                        OR (hp."interestedIn" = 'male' AND ${e.gender} = 'male')
                        OR (hp."interestedIn" = 'female' AND ${e.gender} = 'female')
                    )
                )
                AND (
                    ${r.interestedIn} = 'all'
                    OR (${r.interestedIn} = 'male' AND u."gender" = 'male')
                    OR (${r.interestedIn} = 'female' AND u."gender" = 'female')
                )
        )
        SELECT *,
            LEAST(
                comeIn15Days * 10 + (comeInAll - comeIn15Days) * 5,
                100
            ) as totalBonus
        FROM RankedUsers
        ORDER BY 
            ownCoordSort DESC,
            ROUND(distance * 100) / 100, 
            totalBonus DESC
        LIMIT 1;
    `)[0]}))}function getITCandidate(e,r,i){return __awaiter(this,void 0,void 0,(function*(){const t=String(r.subType);return(yield postgres_1.prisma.$queryRaw`
        WITH RankedUsers AS (
            SELECT u.*,
                6371 * acos(
                    cos(radians(${e.latitude})) * cos(radians("latitude")) *
                    cos(radians("longitude") - radians(${e.longitude})) +
                    sin(radians(${e.latitude})) * sin(radians("latitude"))
                ) as distance,
                CASE WHEN ${e.ownCoordinates} IS TRUE AND "ownCoordinates" IS TRUE THEN 1 ELSE 0 END as ownCoordSort,
                CAST(
                    (
                        SELECT COUNT(*) 
                        FROM "User" as refs 
                        WHERE refs."referrerId" = u."id" 
                        AND refs."createdAt" >= ${i}
                    ) AS INTEGER
                ) as comeIn15Days,
                CAST(
                    (
                        SELECT COUNT(*) 
                        FROM "User" as refs 
                        WHERE refs."referrerId" = u."id"
                    ) AS INTEGER
                ) as comeInAll
            FROM "User" u
            WHERE "id" <> ${e.id}
                AND "id" NOT IN (
                    SELECT ip."userId"
                    FROM "ProfileLike" pl
                    JOIN "ItProfile" ip ON ip."id" = pl."toProfileId"
                    WHERE pl."fromProfileId" IN (
                        SELECT "id" FROM "ItProfile" WHERE "userId" = ${e.id} AND "subType"::text = ${t}
                    )
                    AND pl."createdAt" >= ${new Date(Date.now()-2592e6)}
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM "Blacklist" b
                    WHERE b."userId" = ${e.id}
                    AND b."targetProfileId" IN (
                        SELECT "id"
                        FROM "ItProfile"
                        WHERE "userId" = u."id"
                        AND "isActive" = true
                    )
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM "UserBan" ub
                    WHERE ub."userId" = u."id"
                    AND ub."isActive" = true
                    AND ub."bannedUntil" > ${new Date}
                )
                AND ABS("age" - ${e.age}) <= 2
                AND EXISTS (
                    SELECT 1 FROM "ItProfile" ip
                    WHERE ip."userId" = u."id"
                    AND ip."isActive" = true
                    AND ip."subType"::text = ${t}
                    AND (
                        ip."interestedIn" = 'all'
                        OR (ip."interestedIn" = 'male' AND ${e.gender} = 'male')
                        OR (ip."interestedIn" = 'female' AND ${e.gender} = 'female')
                    )
                )
                AND (
                    ${r.interestedIn} = 'all'
                    OR (${r.interestedIn} = 'male' AND u."gender" = 'male')
                    OR (${r.interestedIn} = 'female' AND u."gender" = 'female')
                )
        )
        SELECT *,
            LEAST(
                comeIn15Days * 10 + (comeInAll - comeIn15Days) * 5,
                100
            ) + 
            CASE 
                WHEN EXISTS (
                    SELECT 1 FROM "ItProfile" ip
                    WHERE ip."userId" = u."id"
                    AND ip."isActive" = true
                    AND ip."subType"::text = ${t}
                    AND ip."experience" = ${r.experience}
                ) THEN 200
                ELSE 0
            END as totalBonus
        FROM RankedUsers u
        ORDER BY 
            ownCoordSort DESC,
            ROUND(distance * 100) / 100, 
            totalBonus DESC
        LIMIT 1;
    `)[0]}))}function getCandidate(e){return __awaiter(this,void 0,void 0,(function*(){var r,i,t,n;try{const t=String(null===(i=null===(r=e.message)||void 0===r?void 0:r.from)||void 0===i?void 0:i.id);if(!t)return e.logger.warn("No user ID found in context"),null;const n=yield postgres_1.prisma.user.findUnique({where:{id:t}});if(!n)return e.logger.warn({userId:t},"User not found"),null;const s=e.session.activeProfile;if(!s)return e.logger.warn({userId:t},"No active profile found in session"),null;const d=new Date(Date.now()-1296e6);let a=null;switch(e.logger.info({userId:t,profileType:s.profileType,profileId:s.id},"Starting candidate search"),s.profileType){case client_1.ProfileType.RELATIONSHIP:a=yield getRelationshipCandidate(n,s,d);break;case client_1.ProfileType.SPORT:a=yield getSportCandidate(n,s,d);break;case client_1.ProfileType.GAME:a=yield getGameCandidate(n,s,d);break;case client_1.ProfileType.HOBBY:a=yield getHobbyCandidate(n,s,d);break;case client_1.ProfileType.IT:a=yield getITCandidate(n,s,d);break;default:return null}if(a){const r=yield(0,profilesService_1.getUserProfile)(a.id,s.profileType,s.profileType!==client_1.ProfileType.RELATIONSHIP?s.subType:void 0);r?(e.session.currentCandidateProfile=r,e.logger.info({userId:t,candidateId:a.id,profileType:s.profileType,candidateProfileId:r.id},"Found candidate and set current candidate profile")):e.logger.warn({userId:t,candidateId:a.id,profileType:s.profileType},"Candidate found but profile not found")}else e.logger.info({userId:t,profileType:s.profileType},"No candidate found for user");return e.logger.info({userId:t,candidateFound:!!a,candidateId:null==a?void 0:a.id,profileType:s.profileType},"Candidate search completed"),a}catch(r){return e.logger.error({userId:null===(n=null===(t=e.message)||void 0===t?void 0:t.from)||void 0===n?void 0:n.id,error:r instanceof Error?r.message:"Unknown error",stack:r instanceof Error?r.stack:void 0},"Error getting candidate"),null}}))}