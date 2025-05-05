/*
  Warnings:

  - You are about to drop the column `authorShare` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `platformShare` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `referrerShare` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `totalEarnings` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AuctionHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AuctionHistory" DROP CONSTRAINT "AuctionHistory_postId_fkey";

-- DropForeignKey
ALTER TABLE "AuctionHistory" DROP CONSTRAINT "AuctionHistory_winnerId_fkey";

-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "Bid_postId_fkey";

-- AlterTable
ALTER TABLE "Bid" ADD COLUMN     "isWinner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lotteryPoolId" TEXT,
ADD COLUMN     "referrerId" TEXT,
ADD COLUMN     "round" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "postId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "auctionRound" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "authorShare",
DROP COLUMN "platformShare",
DROP COLUMN "referrerShare",
ADD COLUMN     "lotteryPoolId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "totalEarnings",
ADD COLUMN     "auctionEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "rewardEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "rewardSpent" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "AuctionHistory";

-- CreateTable
CREATE TABLE "LotteryPool" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "winnerId" TEXT,
    "round" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LotteryPool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LotteryPool_postId_key" ON "LotteryPool"("postId");

-- CreateIndex
CREATE INDEX "LotteryPool_postId_idx" ON "LotteryPool"("postId");

-- CreateIndex
CREATE INDEX "LotteryPool_winnerId_idx" ON "LotteryPool"("winnerId");

-- CreateIndex
CREATE INDEX "LotteryPool_round_idx" ON "LotteryPool"("round");

-- CreateIndex
CREATE INDEX "Bid_referrerId_idx" ON "Bid"("referrerId");

-- CreateIndex
CREATE INDEX "Bid_lotteryPoolId_idx" ON "Bid"("lotteryPoolId");

-- CreateIndex
CREATE INDEX "Bid_round_idx" ON "Bid"("round");

-- RenameForeignKey
ALTER TABLE "Bid" RENAME CONSTRAINT "Bid_userId_fkey" TO "BidUser_fkey";

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_lotteryPoolId_fkey" FOREIGN KEY ("lotteryPoolId") REFERENCES "LotteryPool"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "BidPost_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_lotteryPoolId_fkey" FOREIGN KEY ("lotteryPoolId") REFERENCES "LotteryPool"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "BidCreator_fkey" FOREIGN KEY ("postId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotteryPool" ADD CONSTRAINT "LotteryPool_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotteryPool" ADD CONSTRAINT "LotteryPool_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
