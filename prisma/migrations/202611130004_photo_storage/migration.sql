CREATE TYPE "PhotoPurpose" AS ENUM ('DONATION', 'RECEIPT', 'DISTRIBUTION');
ALTER TABLE "delivery_receipts" ADD COLUMN "photoUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
CREATE TABLE "photo_assets" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "purpose" "PhotoPurpose" NOT NULL,
  "originalName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL DEFAULT 'image/webp',
  "byteSize" INTEGER NOT NULL,
  "width" INTEGER NOT NULL,
  "height" INTEGER NOT NULL,
  "data" BYTEA NOT NULL,
  "donationId" TEXT,
  "claimId" TEXT,
  "attachedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "photo_assets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "photo_assets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "photo_assets_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "donations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "photo_assets_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "photo_assets_size_check" CHECK ("byteSize" > 0 AND "byteSize" <= 2097152),
  CONSTRAINT "photo_assets_dimensions_check" CHECK ("width" > 0 AND "height" > 0 AND "width" <= 1600 AND "height" <= 1600)
);
CREATE INDEX "photo_assets_ownerId_createdAt_idx" ON "photo_assets"("ownerId", "createdAt");
CREATE INDEX "photo_assets_donationId_idx" ON "photo_assets"("donationId");
CREATE INDEX "photo_assets_claimId_idx" ON "photo_assets"("claimId");
