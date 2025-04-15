/*
  Warnings:

  - You are about to drop the column `targetId` on the `Blacklist` table. All the data in the column will be lost.
  - Added the required column `targetProfileId` to the `Blacklist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetUserId` to the `Blacklist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Blacklist" DROP COLUMN "targetId",
ADD COLUMN     "targetProfileId" TEXT NOT NULL,
ADD COLUMN     "targetUserId" TEXT NOT NULL;
