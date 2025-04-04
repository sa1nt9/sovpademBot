/*
  Warnings:

  - You are about to drop the column `gameType` on the `GameProfile` table. All the data in the column will be lost.
  - You are about to drop the column `hobbyType` on the `HobbyProfile` table. All the data in the column will be lost.
  - You are about to drop the column `itType` on the `ITProfile` table. All the data in the column will be lost.
  - You are about to drop the column `sportType` on the `SportProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,subType]` on the table `GameProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,subType]` on the table `HobbyProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,subType]` on the table `ITProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,subType]` on the table `SportProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subType` to the `GameProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subType` to the `HobbyProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subType` to the `ITProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subType` to the `SportProfile` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "GameProfile_userId_gameType_key";

-- DropIndex
DROP INDEX "HobbyProfile_userId_hobbyType_key";

-- DropIndex
DROP INDEX "ITProfile_userId_itType_key";

-- DropIndex
DROP INDEX "SportProfile_userId_sportType_key";

-- AlterTable
ALTER TABLE "GameProfile" DROP COLUMN "gameType",
ADD COLUMN     "subType" "GameType" NOT NULL;

-- AlterTable
ALTER TABLE "HobbyProfile" DROP COLUMN "hobbyType",
ADD COLUMN     "subType" "HobbyType" NOT NULL;

-- AlterTable
ALTER TABLE "ITProfile" DROP COLUMN "itType",
ADD COLUMN     "subType" "ITType" NOT NULL;

-- AlterTable
ALTER TABLE "SportProfile" DROP COLUMN "sportType",
ADD COLUMN     "subType" "SportType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GameProfile_userId_subType_key" ON "GameProfile"("userId", "subType");

-- CreateIndex
CREATE UNIQUE INDEX "HobbyProfile_userId_subType_key" ON "HobbyProfile"("userId", "subType");

-- CreateIndex
CREATE UNIQUE INDEX "ITProfile_userId_subType_key" ON "ITProfile"("userId", "subType");

-- CreateIndex
CREATE UNIQUE INDEX "SportProfile_userId_subType_key" ON "SportProfile"("userId", "subType");
