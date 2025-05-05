-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "allowBidding" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "biddingDueDate" TIMESTAMP(3),
ADD COLUMN     "startPrice" DOUBLE PRECISION;
