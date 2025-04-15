-- AlterTable
ALTER TABLE "GameProfile" ADD COLUMN     "profileType" TEXT NOT NULL DEFAULT 'GAME';

-- AlterTable
ALTER TABLE "HobbyProfile" ADD COLUMN     "profileType" TEXT NOT NULL DEFAULT 'HOBBY';

-- AlterTable
ALTER TABLE "ITProfile" ADD COLUMN     "profileType" TEXT NOT NULL DEFAULT 'IT';

-- AlterTable
ALTER TABLE "RelationshipProfile" ADD COLUMN     "profileType" TEXT NOT NULL DEFAULT 'RELATIONSHIP';

-- AlterTable
ALTER TABLE "SportProfile" ADD COLUMN     "profileType" TEXT NOT NULL DEFAULT 'SPORT';
