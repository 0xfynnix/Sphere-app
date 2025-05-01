-- CreateTable
CREATE TABLE "FilebaseImage" (
    "id" TEXT NOT NULL,
    "cid" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "postId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FilebaseImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FilebaseImage_cid_key" ON "FilebaseImage"("cid");

-- CreateIndex
CREATE INDEX "FilebaseImage_postId_idx" ON "FilebaseImage"("postId");

-- AddForeignKey
ALTER TABLE "FilebaseImage" ADD CONSTRAINT "FilebaseImage_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
