/*
  Warnings:

  - You are about to drop the `ITProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ITProfile" DROP CONSTRAINT "ITProfile_userId_fkey";

-- DropTable
DROP TABLE "ITProfile";

-- CreateTable
CREATE TABLE "ItProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileType" TEXT NOT NULL DEFAULT 'IT',
    "interestedIn" "InterestedIn" NOT NULL,
    "subType" "ITType" NOT NULL,
    "experience" TEXT NOT NULL,
    "technologies" TEXT,
    "github" TEXT,
    "description" TEXT,
    "files" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItProfile_userId_subType_key" ON "ItProfile"("userId", "subType");

-- AddForeignKey
ALTER TABLE "ItProfile" ADD CONSTRAINT "ItProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
