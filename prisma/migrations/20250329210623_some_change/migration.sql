/*
  Warnings:

  - You are about to drop the `UserLike` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserLike" DROP CONSTRAINT "UserLike_targetId_fkey";

-- DropForeignKey
ALTER TABLE "UserLike" DROP CONSTRAINT "UserLike_userId_fkey";

-- DropTable
DROP TABLE "UserLike";
