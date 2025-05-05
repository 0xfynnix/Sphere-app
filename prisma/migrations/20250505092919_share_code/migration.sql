/*
  Warnings:

  - A unique constraint covering the columns `[shareCode]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shareCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "shareCode" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "shareCode" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Post_shareCode_key" ON "Post"("shareCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_shareCode_key" ON "User"("shareCode");
