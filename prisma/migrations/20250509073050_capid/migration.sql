/*
  Warnings:

  - You are about to drop the column `auctionObjectId` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AuctionHistory" ADD COLUMN     "auctionCapObjectId" TEXT,
ADD COLUMN     "auctionObjectId" TEXT;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "auctionObjectId";
