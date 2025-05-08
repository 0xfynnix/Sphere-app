-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "BidCreator_fkey";

-- AlterTable
ALTER TABLE "Bid" ADD COLUMN     "creatorId" TEXT;

-- CreateIndex
CREATE INDEX "Bid_creatorId_idx" ON "Bid"("creatorId");

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "BidCreator_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
