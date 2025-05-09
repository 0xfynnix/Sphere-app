/*
  Warnings:

  - You are about to drop the column `lotteryClaimed` on the `Reward` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "LotteryPool" DROP CONSTRAINT "LotteryPool_postId_fkey";

-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "lotteryClaimed";

-- AddForeignKey
ALTER TABLE "LotteryPool" ADD CONSTRAINT "LotteryPool_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
