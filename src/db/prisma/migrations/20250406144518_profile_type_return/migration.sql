/*
  Warnings:

  - Added the required column `profileType` to the `ProfileLike` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProfileLike" ADD COLUMN     "profileType" "ProfileType" NOT NULL;
