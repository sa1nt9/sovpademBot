/*
  Warnings:

  - You are about to drop the column `fromProfileType` on the `ProfileLike` table. All the data in the column will be lost.
  - You are about to drop the column `toProfileType` on the `ProfileLike` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - Added the required column `profileType` to the `ProfileLike` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProfileLike" DROP COLUMN "fromProfileType",
DROP COLUMN "toProfileType",
ADD COLUMN     "profileType" "ProfileType" NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isActive";
