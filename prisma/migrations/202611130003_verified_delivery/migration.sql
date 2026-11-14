CREATE TYPE "VerificationKind" AS ENUM ('PICKUP', 'DELIVERY');
CREATE TYPE "MissionRouteStage" AS ENUM ('assigned', 'en_route_pickup', 'at_pickup', 'cargo_loaded', 'en_route_dropoff', 'completed');
ALTER TABLE "claims" ADD COLUMN "routeStage" "MissionRouteStage" NOT NULL DEFAULT 'assigned';
UPDATE "claims" SET "routeStage" = 'cargo_loaded' WHERE "status" = 'PICKED_UP';
UPDATE "claims" SET "routeStage" = 'completed' WHERE "status" IN ('DELIVERED', 'DISTRIBUTED');
ALTER TABLE "distribution_records" ADD COLUMN "photoNames" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
CREATE TABLE "handover_challenges" (
  "id" TEXT NOT NULL,
  "claimId" TEXT NOT NULL,
  "kind" "VerificationKind" NOT NULL,
  "codeHash" TEXT NOT NULL,
  "issuedByUserId" TEXT NOT NULL,
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "consumedAt" TIMESTAMP(3),
  CONSTRAINT "handover_challenges_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "handover_challenges_claimId_kind_key" ON "handover_challenges" ("claimId", "kind");
CREATE INDEX "handover_challenges_expiresAt_idx" ON "handover_challenges" ("expiresAt");
ALTER TABLE "handover_challenges" ADD CONSTRAINT "handover_challenges_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "handover_challenges" ADD CONSTRAINT "handover_challenges_issuedByUserId_fkey" FOREIGN KEY ("issuedByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
