/*
  Warnings:

  - You are about to drop the column `portfolioLink` on the `ITProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ITProfile" DROP COLUMN "portfolioLink",
ADD COLUMN     "github" TEXT;
