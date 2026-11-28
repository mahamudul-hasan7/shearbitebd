-- Add the existing donor document relation to databases created by migrations.
ALTER TABLE "donor_profiles" ADD COLUMN "verificationDocumentId" TEXT;

CREATE UNIQUE INDEX "donor_profiles_verificationDocumentId_key"
ON "donor_profiles"("verificationDocumentId");

ALTER TABLE "donor_profiles"
ADD CONSTRAINT "donor_profiles_verificationDocumentId_fkey"
FOREIGN KEY ("verificationDocumentId") REFERENCES "verification_documents"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
