-- AlterTable
ALTER TABLE "SuiTransaction" ADD COLUMN     "postId" TEXT;

-- CreateIndex
CREATE INDEX "SuiTransaction_postId_idx" ON "SuiTransaction"("postId");

-- AddForeignKey
ALTER TABLE "SuiTransaction" ADD CONSTRAINT "SuiTransaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
