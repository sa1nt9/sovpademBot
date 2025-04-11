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
const client_1 = require("@prisma/client");
const postgres_1 = require("../../db/postgres");
const profilesService_1 = require("./profilesService");
// Поиск кандидатов для анкеты отношений
function getRelationshipCandidate(user, activeProfile, fifteenDaysAgo) {
    return __awaiter(this, void 0, void 0, function* () {
        const candidates = yield postgres_1.prisma.$queryRaw `
        WITH RankedUsers AS (
            SELECT u.*,
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
                        WHERE refs."referrerId" = u."id" 
                        AND refs."createdAt" >= ${fifteenDaysAgo}
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
            WHERE "id" <> ${user.id}
                AND "id" NOT IN (
                    SELECT rp."userId"
                    FROM "ProfileLike" pl
                    JOIN "RelationshipProfile" rp ON rp."id" = pl."toProfileId"
                    WHERE pl."fromProfileId" IN (
                        SELECT "id" FROM "RelationshipProfile" WHERE "userId" = ${user.id}
                    )
                    AND pl."createdAt" >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM "Blacklist" b
                    WHERE b."userId" = ${user.id}
                    AND b."targetProfileId" IN (
                        SELECT "id"
                        FROM "RelationshipProfile"
                        WHERE "userId" = u."id"
                        AND "isActive" = true
                    )
                )
                AND ABS("age" - ${user.age}) <= 2
                AND EXISTS (
                    SELECT 1 FROM "RelationshipProfile" rp
                    WHERE rp."userId" = u."id"
                    AND rp."isActive" = true
                    AND (
                        rp."interestedIn" = 'all'
                        OR (rp."interestedIn" = 'male' AND ${user.gender} = 'male')
                        OR (rp."interestedIn" = 'female' AND ${user.gender} = 'female')
                    )
                )
                AND (
                    ${activeProfile.interestedIn} = 'all'
                    OR (${activeProfile.interestedIn} = 'male' AND u."gender" = 'male')
                    OR (${activeProfile.interestedIn} = 'female' AND u."gender" = 'female')
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
    `;
        return candidates[0];
    });
}
// Поиск кандидатов для анкеты спорта
function getSportCandidate(user, activeProfile, fifteenDaysAgo) {
    return __awaiter(this, void 0, void 0, function* () {
        const candidates = yield postgres_1.prisma.$queryRaw `
        WITH RankedUsers AS (
            SELECT u.*,
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
                        WHERE refs."referrerId" = u."id" 
                        AND refs."createdAt" >= ${fifteenDaysAgo}
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
            WHERE "id" <> ${user.id}
                AND "id" NOT IN (
                    SELECT sp."userId"
                    FROM "ProfileLike" pl
                    JOIN "SportProfile" sp ON sp."id" = pl."toProfileId"
                    WHERE pl."fromProfileId" IN (
                        SELECT "id" FROM "SportProfile" WHERE "userId" = ${user.id} AND "subType" = ${activeProfile.subType}
                    )
                    AND pl."createdAt" >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM "Blacklist" b
                    WHERE b."userId" = ${user.id}
                    AND b."targetProfileId" IN (
                        SELECT "id"
                        FROM "SportProfile"
                        WHERE "userId" = u."id"
                        AND "isActive" = true
                    )
                )
                AND ABS("age" - ${user.age}) <= 2
                AND EXISTS (
                    SELECT 1 FROM "SportProfile" sp
                    WHERE sp."userId" = u."id"
                    AND sp."isActive" = true
                    AND sp."subType" = ${activeProfile.subType}
                    AND (
                        sp."interestedIn" = 'all'
                        OR (sp."interestedIn" = 'male' AND ${user.gender} = 'male')
                        OR (sp."interestedIn" = 'female' AND ${user.gender} = 'female')
                    )
                )
                AND (
                    ${activeProfile.interestedIn} = 'all'
                    OR (${activeProfile.interestedIn} = 'male' AND u."gender" = 'male')
                    OR (${activeProfile.interestedIn} = 'female' AND u."gender" = 'female')
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
                    AND sp."subType" = ${activeProfile.subType}
                    AND sp."level" = ${activeProfile.level}
                ) THEN 50
                ELSE 0
            END as totalBonus
        FROM RankedUsers
        ORDER BY 
            ownCoordSort DESC,
            ROUND(distance * 100) / 100, 
            totalBonus DESC
        LIMIT 1;
    `;
        return candidates[0];
    });
}
// Поиск кандидатов для анкеты игры
function getGameCandidate(user, activeProfile, fifteenDaysAgo) {
    return __awaiter(this, void 0, void 0, function* () {
        const candidates = yield postgres_1.prisma.$queryRaw `
        WITH RankedUsers AS (
            SELECT u.*,
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
                        WHERE refs."referrerId" = u."id" 
                        AND refs."createdAt" >= ${fifteenDaysAgo}
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
            WHERE "id" <> ${user.id}
                AND "id" NOT IN (
                    SELECT gp."userId"
                    FROM "ProfileLike" pl
                    JOIN "GameProfile" gp ON gp."id" = pl."toProfileId"
                    WHERE pl."fromProfileId" IN (
                        SELECT "id" FROM "GameProfile" WHERE "userId" = ${user.id} AND "subType" = ${activeProfile.subType}
                    )
                    AND pl."createdAt" >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM "Blacklist" b
                    WHERE b."userId" = ${user.id}
                    AND b."targetProfileId" IN (
                        SELECT "id"
                        FROM "GameProfile"
                        WHERE "userId" = u."id"
                        AND "isActive" = true
                    )
                )
                AND ABS("age" - ${user.age}) <= 2
                AND EXISTS (
                    SELECT 1 FROM "GameProfile" gp
                    WHERE gp."userId" = u."id"
                    AND gp."isActive" = true
                    AND gp."subType" = ${activeProfile.subType}
                    AND (
                        gp."interestedIn" = 'all'
                        OR (gp."interestedIn" = 'male' AND ${user.gender} = 'male')
                        OR (gp."interestedIn" = 'female' AND ${user.gender} = 'female')
                    )
                )
                AND (
                    ${activeProfile.interestedIn} = 'all'
                    OR (${activeProfile.interestedIn} = 'male' AND u."gender" = 'male')
                    OR (${activeProfile.interestedIn} = 'female' AND u."gender" = 'female')
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
    `;
        return candidates[0];
    });
}
// Поиск кандидатов для анкеты хобби
function getHobbyCandidate(user, activeProfile, fifteenDaysAgo) {
    return __awaiter(this, void 0, void 0, function* () {
        const candidates = yield postgres_1.prisma.$queryRaw `
        WITH RankedUsers AS (
            SELECT u.*,
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
                        WHERE refs."referrerId" = u."id" 
                        AND refs."createdAt" >= ${fifteenDaysAgo}
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
            WHERE "id" <> ${user.id}
                AND "id" NOT IN (
                    SELECT hp."userId"
                    FROM "ProfileLike" pl
                    JOIN "HobbyProfile" hp ON hp."id" = pl."toProfileId"
                    WHERE pl."fromProfileId" IN (
                        SELECT "id" FROM "HobbyProfile" WHERE "userId" = ${user.id} AND "subType" = ${activeProfile.subType}
                    )
                    AND pl."createdAt" >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM "Blacklist" b
                    WHERE b."userId" = ${user.id}
                    AND b."targetProfileId" IN (
                        SELECT "id"
                        FROM "HobbyProfile"
                        WHERE "userId" = u."id"
                        AND "isActive" = true
                    )
                )
                AND ABS("age" - ${user.age}) <= 2
                AND EXISTS (
                    SELECT 1 FROM "HobbyProfile" hp
                    WHERE hp."userId" = u."id"
                    AND hp."isActive" = true
                    AND hp."subType" = ${activeProfile.subType}
                    AND (
                        hp."interestedIn" = 'all'
                        OR (hp."interestedIn" = 'male' AND ${user.gender} = 'male')
                        OR (hp."interestedIn" = 'female' AND ${user.gender} = 'female')
                    )
                )
                AND (
                    ${activeProfile.interestedIn} = 'all'
                    OR (${activeProfile.interestedIn} = 'male' AND u."gender" = 'male')
                    OR (${activeProfile.interestedIn} = 'female' AND u."gender" = 'female')
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
    `;
        return candidates[0];
    });
}
// Поиск кандидатов для анкеты IT
function getITCandidate(user, activeProfile, fifteenDaysAgo) {
    return __awaiter(this, void 0, void 0, function* () {
        const candidates = yield postgres_1.prisma.$queryRaw `
        WITH RankedUsers AS (
            SELECT u.*,
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
                        WHERE refs."referrerId" = u."id" 
                        AND refs."createdAt" >= ${fifteenDaysAgo}
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
            WHERE "id" <> ${user.id}
                AND "id" NOT IN (
                    SELECT ip."userId"
                    FROM "ProfileLike" pl
                    JOIN "ITProfile" ip ON ip."id" = pl."toProfileId"
                    WHERE pl."fromProfileId" IN (
                        SELECT "id" FROM "ITProfile" WHERE "userId" = ${user.id} AND "subType" = ${activeProfile.subType}
                    )
                    AND pl."createdAt" >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM "Blacklist" b
                    WHERE b."userId" = ${user.id}
                    AND b."targetProfileId" IN (
                        SELECT "id"
                        FROM "ITProfile"
                        WHERE "userId" = u."id"
                        AND "isActive" = true
                    )
                )
                AND ABS("age" - ${user.age}) <= 2
                AND EXISTS (
                    SELECT 1 FROM "ITProfile" ip
                    WHERE ip."userId" = u."id"
                    AND ip."isActive" = true
                    AND ip."subType" = ${activeProfile.subType}
                    AND (
                        ip."interestedIn" = 'all'
                        OR (ip."interestedIn" = 'male' AND ${user.gender} = 'male')
                        OR (ip."interestedIn" = 'female' AND ${user.gender} = 'female')
                    )
                )
                AND (
                    ${activeProfile.interestedIn} = 'all'
                    OR (${activeProfile.interestedIn} = 'male' AND u."gender" = 'male')
                    OR (${activeProfile.interestedIn} = 'female' AND u."gender" = 'female')
                )
        )
        SELECT *,
            LEAST(
                comeIn15Days * 10 + (comeInAll - comeIn15Days) * 5,
                100
            ) + 
            CASE 
                WHEN EXISTS (
                    SELECT 1 FROM "ITProfile" ip
                    WHERE ip."userId" = u."id"
                    AND ip."isActive" = true
                    AND ip."subType" = ${activeProfile.subType}
                    AND ip."experience" = ${activeProfile.experience}
                ) THEN 200
                ELSE 0
            END as totalBonus
        FROM RankedUsers
        ORDER BY 
            ownCoordSort DESC,
            ROUND(distance * 100) / 100, 
            totalBonus DESC
        LIMIT 1;
    `;
        return candidates[0];
    });
}
function getCandidate(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = String((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id);
            const user = yield postgres_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user)
                return null;
            // Получаем активный профиль пользователя
            const activeProfile = ctx.session.activeProfile;
            if (!activeProfile)
                return null;
            const now = new Date();
            const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
            let candidate = null;
            switch (activeProfile.profileType) {
                case client_1.ProfileType.RELATIONSHIP:
                    candidate = yield getRelationshipCandidate(user, activeProfile, fifteenDaysAgo);
                    break;
                case client_1.ProfileType.SPORT:
                    candidate = yield getSportCandidate(user, activeProfile, fifteenDaysAgo);
                    break;
                case client_1.ProfileType.GAME:
                    candidate = yield getGameCandidate(user, activeProfile, fifteenDaysAgo);
                    break;
                case client_1.ProfileType.HOBBY:
                    candidate = yield getHobbyCandidate(user, activeProfile, fifteenDaysAgo);
                    break;
                case client_1.ProfileType.IT:
                    candidate = yield getITCandidate(user, activeProfile, fifteenDaysAgo);
                    break;
                default:
                    return null;
            }
            if (candidate) {
                // Проверяем, не забанен ли кандидат
                const candidateBan = yield postgres_1.prisma.userBan.findFirst({
                    where: {
                        userId: candidate.id,
                        isActive: true,
                        bannedUntil: {
                            gt: now
                        }
                    }
                });
                if (candidateBan) {
                    ctx.logger.info(`Candidate ${candidate.id} is banned, skipping`);
                    return null;
                }
                // Получаем профиль кандидата того же типа, что и активный профиль
                const candidateProfile = yield (0, profilesService_1.getUserProfile)(candidate.id, activeProfile.profileType, activeProfile.profileType !== client_1.ProfileType.RELATIONSHIP ? activeProfile.subType : undefined);
                if (candidateProfile) {
                    ctx.session.currentCandidateProfile = candidateProfile;
                }
            }
            return candidate;
        }
        catch (error) {
            ctx.logger.error(error, 'Error getting candidate');
            return null;
        }
    });
}
