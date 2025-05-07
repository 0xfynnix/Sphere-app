-- AlterTable
ALTER TABLE "SuiTransaction" ADD COLUMN     "bidId" TEXT;

-- CreateIndex
CREATE INDEX "SuiTransaction_bidId_idx" ON "SuiTransaction"("bidId");

-- AddForeignKey
ALTER TABLE "SuiTransaction" ADD CONSTRAINT "SuiTransaction_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;
