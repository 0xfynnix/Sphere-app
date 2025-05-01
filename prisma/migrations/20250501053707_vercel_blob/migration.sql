-- CreateTable
CREATE TABLE "VercelBlobImage" (
    "id" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "postId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VercelBlobImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VercelBlobImage_pathname_key" ON "VercelBlobImage"("pathname");

-- CreateIndex
CREATE INDEX "VercelBlobImage_postId_idx" ON "VercelBlobImage"("postId");

-- AddForeignKey
ALTER TABLE "VercelBlobImage" ADD CONSTRAINT "VercelBlobImage_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
