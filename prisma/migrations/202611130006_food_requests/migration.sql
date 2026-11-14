ALTER TYPE "RequestType" ADD VALUE 'EMERGENCY';
ALTER TABLE "food_requests"
  ADD COLUMN "deliveryAddressId" TEXT,
  ADD COLUMN "mealsFulfilled" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "submissionKey" TEXT,
  ADD COLUMN "submissionHash" TEXT;
ALTER TABLE "claims"
  ADD COLUMN "foodRequestId" TEXT,
  ADD COLUMN "requestMealsAllocated" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "food_requests" ADD CONSTRAINT "food_requests_deliveryAddressId_fkey" FOREIGN KEY ("deliveryAddressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "claims" ADD CONSTRAINT "claims_foodRequestId_fkey" FOREIGN KEY ("foodRequestId") REFERENCES "food_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE UNIQUE INDEX "food_requests_ngoProfileId_submissionKey_key" ON "food_requests"("ngoProfileId", "submissionKey");
CREATE INDEX "food_requests_ngoProfileId_status_neededBy_idx" ON "food_requests"("ngoProfileId", "status", "neededBy");
CREATE INDEX "claims_foodRequestId_idx" ON "claims"("foodRequestId");
ALTER TABLE "food_requests" ADD CONSTRAINT "food_requests_mealsFulfilled_check" CHECK ("mealsFulfilled" >= 0);
ALTER TABLE "claims" ADD CONSTRAINT "claims_requestMealsAllocated_check" CHECK ("requestMealsAllocated" >= 0);
