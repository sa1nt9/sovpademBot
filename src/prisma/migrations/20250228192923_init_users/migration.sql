/*
  Warnings:

  - Added the required column `key` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "value" TEXT,
ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("key");
