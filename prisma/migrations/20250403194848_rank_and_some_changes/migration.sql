/*
  Warnings:

  - You are about to drop the column `rank` on the `GameProfile` table. All the data in the column will be lost.
  - Added the required column `interestedIn` to the `GameProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interestedIn` to the `HobbyProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interestedIn` to the `ITProfile` table without a default value. This is not possible if the table is not empty.
  - Made the column `experience` on table `ITProfile` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `interestedIn` to the `SportProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameProfile" DROP COLUMN "rank",
ADD COLUMN     "interestedIn" "InterestedIn" NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "HobbyProfile" ADD COLUMN     "interestedIn" "InterestedIn" NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ITProfile" ADD COLUMN     "interestedIn" "InterestedIn" NOT NULL,
ALTER COLUMN "experience" SET NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RelationshipProfile" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SportProfile" ADD COLUMN     "interestedIn" "InterestedIn" NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;
