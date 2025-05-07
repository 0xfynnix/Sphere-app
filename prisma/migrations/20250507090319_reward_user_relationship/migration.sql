/*
  Warnings:

  - Added the required column `recipientId` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reward" ADD COLUMN     "recipientId" TEXT NOT NULL,
ADD COLUMN     "senderId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Reward_senderId_idx" ON "Reward"("senderId");

-- CreateIndex
CREATE INDEX "Reward_recipientId_idx" ON "Reward"("recipientId");

-- CreateIndex
CREATE INDEX "Reward_postId_idx" ON "Reward"("postId");

-- CreateIndex
CREATE INDEX "Reward_referrerId_idx" ON "Reward"("referrerId");

-- CreateIndex
CREATE INDEX "Reward_lotteryPoolId_idx" ON "Reward"("lotteryPoolId");

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
