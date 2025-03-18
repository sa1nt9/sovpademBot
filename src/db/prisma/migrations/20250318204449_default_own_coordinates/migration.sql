/*
  Warnings:

  - Made the column `ownCoordinates` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "ownCoordinates" SET NOT NULL,
ALTER COLUMN "ownCoordinates" SET DEFAULT false;
