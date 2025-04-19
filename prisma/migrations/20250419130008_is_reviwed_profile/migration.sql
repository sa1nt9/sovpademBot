-- AlterTable
ALTER TABLE "GameProfile" ADD COLUMN     "isReviewed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "HobbyProfile" ADD COLUMN     "isReviewed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ItProfile" ADD COLUMN     "isReviewed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "RelationshipProfile" ADD COLUMN     "isReviewed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SportProfile" ADD COLUMN     "isReviewed" BOOLEAN NOT NULL DEFAULT false;
