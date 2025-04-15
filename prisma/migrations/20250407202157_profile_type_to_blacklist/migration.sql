/*
  Warnings:

  - Added the required column `profileType` to the `Blacklist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Blacklist" ADD COLUMN     "profileType" "ProfileType" NOT NULL;
