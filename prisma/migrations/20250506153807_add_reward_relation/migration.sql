-- AlterTable
ALTER TABLE "SuiTransaction" ADD COLUMN     "rewardId" TEXT;

-- CreateIndex
CREATE INDEX "SuiTransaction_rewardId_idx" ON "SuiTransaction"("rewardId");

-- AddForeignKey
ALTER TABLE "SuiTransaction" ADD CONSTRAINT "SuiTransaction_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE SET NULL ON UPDATE CASCADE;
