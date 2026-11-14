ALTER TYPE "PhotoPurpose" ADD VALUE 'INCIDENT';
CREATE TYPE "IncidentDecision" AS ENUM ('RESUME', 'REJECT_FOOD');
ALTER TABLE "claims" ADD COLUMN "incidentHoldStatus" "ClaimStatus";
ALTER TABLE "incident_reports"
  ADD COLUMN "submissionKey" TEXT,
  ADD COLUMN "submissionHash" TEXT,
  ADD COLUMN "blocksRescue" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "decision" "IncidentDecision";
CREATE UNIQUE INDEX "incident_reports_reportedByUserId_submissionKey_key" ON "incident_reports"("reportedByUserId", "submissionKey");
CREATE INDEX "incident_reports_claimId_status_idx" ON "incident_reports"("claimId", "status");
CREATE TABLE "incident_reviews" (
  "id" TEXT NOT NULL,
  "incidentId" TEXT NOT NULL,
  "actorUserId" TEXT,
  "actorLabel" TEXT NOT NULL,
  "status" "IncidentStatus" NOT NULL,
  "decision" "IncidentDecision",
  "note" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "incident_reviews_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "incident_reviews_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incident_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "incident_reviews_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "incident_reviews_incidentId_createdAt_idx" ON "incident_reviews"("incidentId", "createdAt");
