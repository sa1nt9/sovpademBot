/*
  Warnings:

  - Added the required column `fromProfileType` to the `ProfileLike` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toProfileType` to the `ProfileLike` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProfileLike" ADD COLUMN     "fromProfileType" "ProfileType" NOT NULL,
ADD COLUMN     "toProfileType" "ProfileType" NOT NULL;
