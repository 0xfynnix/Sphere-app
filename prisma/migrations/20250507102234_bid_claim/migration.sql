/*
  Warnings:

  - Added the required column `platformAmount` to the `Bid` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bid" ADD COLUMN     "creatorAmount" DOUBLE PRECISION,
ADD COLUMN     "creatorClaimed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lotteryAmount" DOUBLE PRECISION,
ADD COLUMN     "lotteryClaimed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "platformAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "platformClaimed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referrerAmount" DOUBLE PRECISION,
ADD COLUMN     "referrerClaimed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referredAuctionEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0;
