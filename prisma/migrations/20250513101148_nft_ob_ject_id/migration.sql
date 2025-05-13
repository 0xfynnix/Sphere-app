-- AlterTable
ALTER TABLE "AuctionHistory" ADD COLUMN     "nftObjectId" TEXT;

-- AlterTable
ALTER TABLE "Reward" ADD COLUMN     "nftObjectId" TEXT;

-- CreateIndex
CREATE INDEX "AuctionHistory_nftObjectId_idx" ON "AuctionHistory"("nftObjectId");

-- CreateIndex
CREATE INDEX "Reward_nftObjectId_idx" ON "Reward"("nftObjectId");
