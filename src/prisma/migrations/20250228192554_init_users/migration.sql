-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "InterestedIn" AS ENUM ('male', 'female', 'all');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "previousName" TEXT,
    "city" TEXT NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "gender" "Gender" NOT NULL,
    "interestedIn" "InterestedIn" NOT NULL,
    "age" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "files" JSONB NOT NULL,
    "ownCoordinates" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (

);
