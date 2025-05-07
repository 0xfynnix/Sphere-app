/*
  Warnings:

  - Added the required column `platformAmount` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientAmount` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reward" ADD COLUMN     "lotteryAmount" DOUBLE PRECISION,
ADD COLUMN     "lotteryClaimed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "platformAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "platformClaimed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recipientAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "recipientClaimed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referrerAmount" DOUBLE PRECISION,
ADD COLUMN     "referrerClaimed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "round" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "Reward_round_idx" ON "Reward"("round");
