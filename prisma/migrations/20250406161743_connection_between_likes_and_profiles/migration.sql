/*
  Warnings:

  - You are about to drop the column `fromProfileType` on the `ProfileLike` table. All the data in the column will be lost.
  - You are about to drop the column `toProfileType` on the `ProfileLike` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProfileLike" DROP CONSTRAINT "ProfileLike_gameFrom_fkey";

-- DropForeignKey
ALTER TABLE "ProfileLike" DROP CONSTRAINT "ProfileLike_gameTo_fkey";

-- DropForeignKey
ALTER TABLE "ProfileLike" DROP CONSTRAINT "ProfileLike_hobbyFrom_fkey";

-- DropForeignKey
ALTER TABLE "ProfileLike" DROP CONSTRAINT "ProfileLike_hobbyTo_fkey";

-- DropForeignKey
ALTER TABLE "ProfileLike" DROP CONSTRAINT "ProfileLike_itFrom_fkey";

-- DropForeignKey
ALTER TABLE "ProfileLike" DROP CONSTRAINT "ProfileLike_itTo_fkey";

-- DropForeignKey
ALTER TABLE "ProfileLike" DROP CONSTRAINT "ProfileLike_relationshipFrom_fkey";

-- DropForeignKey
ALTER TABLE "ProfileLike" DROP CONSTRAINT "ProfileLike_relationshipTo_fkey";

-- DropForeignKey
ALTER TABLE "ProfileLike" DROP CONSTRAINT "ProfileLike_sportFrom_fkey";

-- DropForeignKey
ALTER TABLE "ProfileLike" DROP CONSTRAINT "ProfileLike_sportTo_fkey";

-- AlterTable
ALTER TABLE "ProfileLike" DROP COLUMN "fromProfileType",
DROP COLUMN "toProfileType";
