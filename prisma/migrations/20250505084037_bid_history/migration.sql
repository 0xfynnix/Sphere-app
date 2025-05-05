-- CreateTable
CREATE TABLE "AuctionHistory" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "winnerId" TEXT NOT NULL,
    "finalPrice" DOUBLE PRECISION NOT NULL,
    "totalBids" INTEGER NOT NULL,
    "startPrice" DOUBLE PRECISION NOT NULL,
    "biddingDueDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuctionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuctionHistory_postId_idx" ON "AuctionHistory"("postId");

-- CreateIndex
CREATE INDEX "AuctionHistory_winnerId_idx" ON "AuctionHistory"("winnerId");

-- AddForeignKey
ALTER TABLE "AuctionHistory" ADD CONSTRAINT "AuctionHistory_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionHistory" ADD CONSTRAINT "AuctionHistory_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
