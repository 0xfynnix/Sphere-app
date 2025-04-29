/*
  Warnings:

  - You are about to drop the column `image` on the `Post` table. All the data in the column will be lost.
  - Added the required column `postId` to the `WalrusImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PostStatus" ADD VALUE 'PENDING';
ALTER TYPE "PostStatus" ADD VALUE 'FAILED';

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "image";

-- AlterTable
ALTER TABLE "WalrusImage" ADD COLUMN     "postId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "WalrusImage_postId_idx" ON "WalrusImage"("postId");

-- AddForeignKey
ALTER TABLE "WalrusImage" ADD CONSTRAINT "WalrusImage_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
