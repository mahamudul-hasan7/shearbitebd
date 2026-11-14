DROP INDEX "claims_donationId_key";
CREATE INDEX "claims_donationId_idx" ON "claims" ("donationId");
CREATE UNIQUE INDEX "claims_one_active_donation"
ON "claims" ("donationId")
WHERE "status" NOT IN ('CANCELLED', 'EXPIRED');
