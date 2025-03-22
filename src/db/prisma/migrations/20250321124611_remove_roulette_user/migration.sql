/*
  Warnings:

  - You are about to drop the `RouletteUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RouletteUser" DROP CONSTRAINT "RouletteUser_chatPartnerId_fkey";

-- DropTable
DROP TABLE "RouletteUser";
