-- AlterTable
ALTER TABLE "RouletteUser" ADD COLUMN     "profileRevealed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "usernameRevealed" BOOLEAN NOT NULL DEFAULT false;
