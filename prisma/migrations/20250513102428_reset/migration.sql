/*
  Warnings:

  - You are about to drop the column `nftObjectId` on the `AuctionHistory` table. All the data in the column will be lost.
  - You are about to drop the column `nftObjectId` on the `Reward` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AuctionHistory_nftObjectId_idx";

-- DropIndex
DROP INDEX "Reward_nftObjectId_idx";

-- AlterTable
ALTER TABLE "AuctionHistory" DROP COLUMN "nftObjectId";

-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "nftObjectId";
