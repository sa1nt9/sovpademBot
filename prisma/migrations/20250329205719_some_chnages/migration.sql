/*
  Warnings:

  - You are about to drop the column `text` on the `RelationshipProfile` table. All the data in the column will be lost.
  - Added the required column `description` to the `RelationshipProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RelationshipProfile" DROP COLUMN "text",
ADD COLUMN     "description" TEXT NOT NULL;
