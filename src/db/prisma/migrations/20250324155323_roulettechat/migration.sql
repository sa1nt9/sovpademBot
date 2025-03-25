-- CreateTable
CREATE TABLE "RouletteChat" (
    "id" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "isProfileRevealed" BOOLEAN NOT NULL DEFAULT false,
    "isUsernameRevealed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RouletteChat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RouletteChat" ADD CONSTRAINT "RouletteChat_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "RouletteUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouletteChat" ADD CONSTRAINT "RouletteChat_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "RouletteUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
