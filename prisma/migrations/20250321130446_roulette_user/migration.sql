-- CreateTable
CREATE TABLE "RouletteUser" (
    "id" TEXT NOT NULL,
    "chatPartnerId" TEXT,
    "searchingPartner" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RouletteUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RouletteUser" ADD CONSTRAINT "RouletteUser_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouletteUser" ADD CONSTRAINT "RouletteUser_chatPartnerId_fkey" FOREIGN KEY ("chatPartnerId") REFERENCES "RouletteUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
