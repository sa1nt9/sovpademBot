/*
  Warnings:

  - Changed the type of `type` on the `PendingNotification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LIKE', 'MUTUAL_LIKE');

-- AlterTable
ALTER TABLE "PendingNotification" DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL;
