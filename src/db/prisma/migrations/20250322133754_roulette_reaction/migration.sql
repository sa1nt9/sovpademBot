-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'DISLIKE', 'CLOWN', 'SMART', 'FUNNY', 'BORING', 'FRIENDLY', 'RUDE');

-- CreateTable
CREATE TABLE "RouletteReaction" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "type" "ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RouletteReaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RouletteReaction" ADD CONSTRAINT "RouletteReaction_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "RouletteUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouletteReaction" ADD CONSTRAINT "RouletteReaction_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "RouletteUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
