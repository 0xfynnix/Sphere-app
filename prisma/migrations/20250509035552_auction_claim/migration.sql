/*
  Warnings:

  - You are about to drop the column `lotteryClaimed` on the `Bid` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[postId,round]` on the table `LotteryPool` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "LotteryPool_postId_key";

-- AlterTable
ALTER TABLE "Bid" DROP COLUMN "lotteryClaimed";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "lotteryRound" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "LotteryPool_postId_round_key" ON "LotteryPool"("postId", "round");
