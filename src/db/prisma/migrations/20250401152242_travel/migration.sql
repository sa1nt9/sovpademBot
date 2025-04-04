/*
  Warnings:

  - The values [TRAVEL] on the enum `ProfileType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `TravelProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProfileType_new" AS ENUM ('RELATIONSHIP', 'SPORT', 'GAME', 'HOBBY', 'IT');
ALTER TABLE "ProfileLike" ALTER COLUMN "fromProfileType" TYPE "ProfileType_new" USING ("fromProfileType"::text::"ProfileType_new");
ALTER TABLE "ProfileLike" ALTER COLUMN "toProfileType" TYPE "ProfileType_new" USING ("toProfileType"::text::"ProfileType_new");
ALTER TYPE "ProfileType" RENAME TO "ProfileType_old";
ALTER TYPE "ProfileType_new" RENAME TO "ProfileType";
DROP TYPE "ProfileType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ProfileLike" DROP CONSTRAINT "ProfileLike_travelFrom_fkey";

-- DropForeignKey
ALTER TABLE "ProfileLike" DROP CONSTRAINT "ProfileLike_travelTo_fkey";

-- DropForeignKey
ALTER TABLE "TravelProfile" DROP CONSTRAINT "TravelProfile_userId_fkey";

-- DropTable
DROP TABLE "TravelProfile";
