-- AlterTable
ALTER TABLE "ngo_profiles" ADD COLUMN     "verificationDocumentId" TEXT;

-- AlterTable
ALTER TABLE "volunteer_profiles" ADD COLUMN     "verificationDocumentId" TEXT;

-- AlterTable
ALTER TABLE "account_reviews" ADD COLUMN     "verificationDocumentId" TEXT;

-- CreateTable
CREATE TABLE "verification_documents" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "pages" INTEGER,
    "data" BYTEA NOT NULL,
    "uploadKey" TEXT NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verification_documents_ownerId_createdAt_idx" ON "verification_documents"("ownerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "verification_documents_ownerId_uploadKey_key" ON "verification_documents"("ownerId", "uploadKey");

-- CreateIndex
CREATE UNIQUE INDEX "ngo_profiles_verificationDocumentId_key" ON "ngo_profiles"("verificationDocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_profiles_verificationDocumentId_key" ON "volunteer_profiles"("verificationDocumentId");

-- AddForeignKey
ALTER TABLE "ngo_profiles" ADD CONSTRAINT "ngo_profiles_verificationDocumentId_fkey" FOREIGN KEY ("verificationDocumentId") REFERENCES "verification_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_profiles" ADD CONSTRAINT "volunteer_profiles_verificationDocumentId_fkey" FOREIGN KEY ("verificationDocumentId") REFERENCES "verification_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_reviews" ADD CONSTRAINT "account_reviews_verificationDocumentId_fkey" FOREIGN KEY ("verificationDocumentId") REFERENCES "verification_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
