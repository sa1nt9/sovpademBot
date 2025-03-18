-- DropForeignKey
ALTER TABLE "UserLike" DROP CONSTRAINT "UserLike_targetId_fkey";

-- DropForeignKey
ALTER TABLE "UserLike" DROP CONSTRAINT "UserLike_userId_fkey";

-- AddForeignKey
ALTER TABLE "UserLike" ADD CONSTRAINT "UserLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLike" ADD CONSTRAINT "UserLike_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
