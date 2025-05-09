/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `AuctionHistory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[postId,round]` on the table `AuctionHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AuctionHistory" ADD COLUMN     "transactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AuctionHistory_transactionId_key" ON "AuctionHistory"("transactionId");

-- CreateIndex
CREATE INDEX "AuctionHistory_transactionId_idx" ON "AuctionHistory"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "AuctionHistory_postId_round_key" ON "AuctionHistory"("postId", "round");

-- AddForeignKey
ALTER TABLE "AuctionHistory" ADD CONSTRAINT "AuctionHistory_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "SuiTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
