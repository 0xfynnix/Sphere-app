-- AlterTable
ALTER TABLE "Bid" ADD COLUMN     "auctionHistoryId" TEXT;

-- CreateTable
CREATE TABLE "AuctionHistory" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "startPrice" DOUBLE PRECISION NOT NULL,
    "finalPrice" DOUBLE PRECISION,
    "totalBids" INTEGER NOT NULL DEFAULT 0,
    "winnerId" TEXT,
    "biddingDueDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuctionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuctionHistory_postId_idx" ON "AuctionHistory"("postId");

-- CreateIndex
CREATE INDEX "AuctionHistory_winnerId_idx" ON "AuctionHistory"("winnerId");

-- CreateIndex
CREATE INDEX "AuctionHistory_round_idx" ON "AuctionHistory"("round");

-- CreateIndex
CREATE INDEX "Bid_auctionHistoryId_idx" ON "Bid"("auctionHistoryId");

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_auctionHistoryId_fkey" FOREIGN KEY ("auctionHistoryId") REFERENCES "AuctionHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionHistory" ADD CONSTRAINT "AuctionHistory_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionHistory" ADD CONSTRAINT "AuctionHistory_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
