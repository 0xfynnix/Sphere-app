-- CreateTable
CREATE TABLE "WalrusImage" (
    "id" TEXT NOT NULL,
    "blobId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalrusImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WalrusImage_blobId_key" ON "WalrusImage"("blobId");

-- CreateIndex
CREATE INDEX "WalrusImage_expiryDate_idx" ON "WalrusImage"("expiryDate");
