/*
  Warnings:

  - You are about to drop the column `files` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `interestedIn` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('RELATIONSHIP', 'SPORT', 'GAME', 'HOBBY', 'IT', 'TRAVEL');

-- CreateEnum
CREATE TYPE "SportType" AS ENUM ('GYM', 'RUNNING', 'SWIMMING', 'FOOTBALL', 'BASKETBALL', 'TENNIS', 'MARTIAL_ARTS', 'YOGA', 'CYCLING', 'CLIMBING', 'SKI_SNOWBOARD');

-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('CS_GO', 'DOTA2', 'VALORANT', 'RUST', 'MINECRAFT', 'LEAGUE_OF_LEGENDS', 'FORTNITE', 'PUBG', 'GTA', 'APEX_LEGENDS', 'FIFA', 'CALL_OF_DUTY', 'WOW', 'GENSHIN_IMPACT');

-- CreateEnum
CREATE TYPE "HobbyType" AS ENUM ('MUSIC', 'DRAWING', 'PHOTOGRAPHY', 'COOKING', 'CRAFTS', 'DANCING', 'READING');

-- CreateEnum
CREATE TYPE "ITType" AS ENUM ('FRONTEND', 'BACKEND', 'FULLSTACK', 'MOBILE', 'DEVOPS', 'QA', 'DATA_SCIENCE', 'GAME_DEV', 'CYBERSECURITY', 'UI_UX');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "files",
DROP COLUMN "gender",
DROP COLUMN "interestedIn",
DROP COLUMN "text";

-- CreateTable
CREATE TABLE "RelationshipProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "interestedIn" "InterestedIn" NOT NULL,
    "text" TEXT NOT NULL,
    "files" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RelationshipProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sportType" "SportType" NOT NULL,
    "level" TEXT,
    "description" TEXT NOT NULL,
    "files" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SportProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameType" "GameType" NOT NULL,
    "rank" TEXT,
    "accountLink" TEXT,
    "description" TEXT NOT NULL,
    "files" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HobbyProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hobbyType" "HobbyType" NOT NULL,
    "description" TEXT NOT NULL,
    "files" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HobbyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ITProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itType" "ITType" NOT NULL,
    "experience" TEXT,
    "technologies" TEXT,
    "portfolioLink" TEXT,
    "description" TEXT NOT NULL,
    "files" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ITProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "files" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileLike" (
    "id" TEXT NOT NULL,
    "fromProfileType" "ProfileType" NOT NULL,
    "fromProfileId" TEXT NOT NULL,
    "toProfileType" "ProfileType" NOT NULL,
    "toProfileId" TEXT NOT NULL,
    "liked" BOOLEAN NOT NULL,
    "message" TEXT,
    "privateNote" TEXT,
    "videoFileId" TEXT,
    "voiceFileId" TEXT,
    "videoNoteFileId" TEXT,
    "isMutual" BOOLEAN NOT NULL DEFAULT false,
    "isMutualAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RelationshipProfile_userId_key" ON "RelationshipProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SportProfile_userId_sportType_key" ON "SportProfile"("userId", "sportType");

-- CreateIndex
CREATE UNIQUE INDEX "GameProfile_userId_gameType_key" ON "GameProfile"("userId", "gameType");

-- CreateIndex
CREATE UNIQUE INDEX "HobbyProfile_userId_hobbyType_key" ON "HobbyProfile"("userId", "hobbyType");

-- CreateIndex
CREATE UNIQUE INDEX "ITProfile_userId_itType_key" ON "ITProfile"("userId", "itType");

-- CreateIndex
CREATE UNIQUE INDEX "TravelProfile_userId_key" ON "TravelProfile"("userId");

-- AddForeignKey
ALTER TABLE "RelationshipProfile" ADD CONSTRAINT "RelationshipProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportProfile" ADD CONSTRAINT "SportProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameProfile" ADD CONSTRAINT "GameProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HobbyProfile" ADD CONSTRAINT "HobbyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ITProfile" ADD CONSTRAINT "ITProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelProfile" ADD CONSTRAINT "TravelProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileLike" ADD CONSTRAINT "ProfileLike_relationshipFrom_fkey" FOREIGN KEY ("fromProfileId") REFERENCES "RelationshipProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileLike" ADD CONSTRAINT "ProfileLike_relationshipTo_fkey" FOREIGN KEY ("toProfileId") REFERENCES "RelationshipProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileLike" ADD CONSTRAINT "ProfileLike_sportFrom_fkey" FOREIGN KEY ("fromProfileId") REFERENCES "SportProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileLike" ADD CONSTRAINT "ProfileLike_sportTo_fkey" FOREIGN KEY ("toProfileId") REFERENCES "SportProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileLike" ADD CONSTRAINT "ProfileLike_gameFrom_fkey" FOREIGN KEY ("fromProfileId") REFERENCES "GameProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileLike" ADD CONSTRAINT "ProfileLike_gameTo_fkey" FOREIGN KEY ("toProfileId") REFERENCES "GameProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileLike" ADD CONSTRAINT "ProfileLike_hobbyFrom_fkey" FOREIGN KEY ("fromProfileId") REFERENCES "HobbyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileLike" ADD CONSTRAINT "ProfileLike_hobbyTo_fkey" FOREIGN KEY ("toProfileId") REFERENCES "HobbyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileLike" ADD CONSTRAINT "ProfileLike_itFrom_fkey" FOREIGN KEY ("fromProfileId") REFERENCES "ITProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileLike" ADD CONSTRAINT "ProfileLike_itTo_fkey" FOREIGN KEY ("toProfileId") REFERENCES "ITProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileLike" ADD CONSTRAINT "ProfileLike_travelFrom_fkey" FOREIGN KEY ("fromProfileId") REFERENCES "TravelProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileLike" ADD CONSTRAINT "ProfileLike_travelTo_fkey" FOREIGN KEY ("toProfileId") REFERENCES "TravelProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
