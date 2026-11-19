-- CreateTable
CREATE TABLE "account_reviews" (
    "id" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "actorLabel" TEXT NOT NULL,
    "previousStatus" "VerificationStatus" NOT NULL,
    "status" "VerificationStatus" NOT NULL,
    "note" TEXT NOT NULL,
    "submissionKey" TEXT NOT NULL,
    "previousUpdatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_reviews_submissionKey_key" ON "account_reviews"("submissionKey");

-- CreateIndex
CREATE INDEX "account_reviews_targetUserId_createdAt_idx" ON "account_reviews"("targetUserId", "createdAt");

-- CreateIndex
CREATE INDEX "account_reviews_createdAt_idx" ON "account_reviews"("createdAt");

-- CreateIndex
CREATE INDEX "users_role_isActive_createdAt_idx" ON "users"("role", "isActive", "createdAt");

-- CreateIndex
CREATE INDEX "donor_profiles_verificationStatus_idx" ON "donor_profiles"("verificationStatus");

-- CreateIndex
CREATE INDEX "ngo_profiles_verificationStatus_idx" ON "ngo_profiles"("verificationStatus");

-- CreateIndex
CREATE INDEX "volunteer_profiles_verificationStatus_idx" ON "volunteer_profiles"("verificationStatus");

-- CreateIndex
CREATE INDEX "claims_status_createdAt_idx" ON "claims"("status", "createdAt");

-- CreateIndex
CREATE INDEX "incident_reports_status_createdAt_idx" ON "incident_reports"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "account_reviews" ADD CONSTRAINT "account_reviews_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_reviews" ADD CONSTRAINT "account_reviews_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
