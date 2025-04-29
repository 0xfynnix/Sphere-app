-- DropForeignKey
ALTER TABLE "WalrusImage" DROP CONSTRAINT "WalrusImage_postId_fkey";

-- AlterTable
ALTER TABLE "WalrusImage" ALTER COLUMN "postId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "WalrusImage" ADD CONSTRAINT "WalrusImage_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
