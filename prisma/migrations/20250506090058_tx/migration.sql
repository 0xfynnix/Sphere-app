-- CreateTable
CREATE TABLE "SuiTransaction" (
    "id" TEXT NOT NULL,
    "digest" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuiTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SuiTransaction_digest_key" ON "SuiTransaction"("digest");

-- CreateIndex
CREATE INDEX "SuiTransaction_userId_idx" ON "SuiTransaction"("userId");

-- CreateIndex
CREATE INDEX "SuiTransaction_digest_idx" ON "SuiTransaction"("digest");

-- CreateIndex
CREATE INDEX "SuiTransaction_type_idx" ON "SuiTransaction"("type");

-- CreateIndex
CREATE INDEX "SuiTransaction_status_idx" ON "SuiTransaction"("status");

-- AddForeignKey
ALTER TABLE "SuiTransaction" ADD CONSTRAINT "SuiTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
