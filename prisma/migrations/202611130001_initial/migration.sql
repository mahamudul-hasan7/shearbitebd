-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('DONOR', 'NGO', 'VOLUNTEER', 'ADMIN');

-- CreateEnum
CREATE TYPE "DonorType" AS ENUM ('INDIVIDUAL', 'CAFETERIA', 'RESTAURANT', 'BAKERY', 'EVENT_ORGANIZER');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FoodCategory" AS ENUM ('COOKED_MEAL', 'BAKERY', 'PRODUCE', 'GROCERIES', 'DAIRY', 'BEVERAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "DietaryType" AS ENUM ('HALAL', 'VEGETARIAN', 'VEGAN', 'CONTAINS_MEAT', 'GLUTEN_FREE', 'OTHER');

-- CreateEnum
CREATE TYPE "StorageCondition" AS ENUM ('AMBIENT', 'REFRIGERATED', 'FROZEN', 'HOT_HOLDING');

-- CreateEnum
CREATE TYPE "FoodCondition" AS ENUM ('FRESHLY_PREPARED', 'SAME_DAY', 'PACKAGED');

-- CreateEnum
CREATE TYPE "QuantityUnit" AS ENUM ('PORTIONS', 'MEALS', 'KILOGRAMS', 'PACKETS', 'TRAYS', 'LITRES');

-- CreateEnum
CREATE TYPE "PriorityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'AVAILABLE', 'RESERVED', 'ASSIGNED', 'PICKED_UP', 'DELIVERED', 'DISTRIBUTED', 'EXPIRED', 'CANCELLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('RESERVED', 'ASSIGNED', 'PICKED_UP', 'DELIVERED', 'DISTRIBUTED', 'CANCELLED', 'EXPIRED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'FINDING_MATCH', 'MATCHED', 'FULFILLED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('ONE_TIME', 'RECURRING');

-- CreateEnum
CREATE TYPE "TransportMethod" AS ENUM ('WALKING', 'BICYCLE', 'MOTORCYCLE', 'VAN', 'CAR');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('URGENT', 'CLAIM', 'VOLUNTEER', 'PICKUP', 'DELIVERY', 'NEARBY_DONATION', 'IMPACT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('DAMAGED_FOOD', 'WRONG_QUANTITY', 'LATE_DELIVERY', 'WRONG_ITEM', 'SAFETY_CONCERN', 'OTHER');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "NGOTeamRole" AS ENUM ('OWNER', 'COORDINATOR', 'FIELD_STAFF', 'VIEWER');

-- CreateEnum
CREATE TYPE "NGOTeamMemberStatus" AS ENUM ('ACTIVE', 'INVITED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "normalizedPhone" TEXT,
    "registrationDetails" JSONB NOT NULL DEFAULT '{}',
    "displayName" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'DONOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "division" TEXT NOT NULL DEFAULT 'Dhaka',
    "district" TEXT NOT NULL DEFAULT 'Dhaka',
    "city" TEXT NOT NULL DEFAULT 'Dhaka',
    "area" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "postalCode" TEXT,
    "landmark" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("tokenHash")
);

-- CreateTable
CREATE TABLE "donor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "donorType" "DonorType" NOT NULL DEFAULT 'RESTAURANT',
    "organizationName" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "bfsaCertNumber" TEXT,
    "rating" DOUBLE PRECISION DEFAULT 5.0,
    "totalDonations" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngo_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "mission" TEXT NOT NULL,
    "vision" TEXT NOT NULL,
    "values" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "beneficiaryTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "acceptedFoodCategories" "FoodCategory"[] DEFAULT ARRAY[]::"FoodCategory"[],
    "authorizedContactUserId" TEXT,
    "serviceAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "capacityMealsPerDay" INTEGER NOT NULL DEFAULT 100,
    "peopleHelped" INTEGER NOT NULL DEFAULT 0,
    "foundedYear" INTEGER NOT NULL DEFAULT 2020,
    "publicEmail" TEXT NOT NULL,
    "publicPhone" TEXT NOT NULL,
    "galleryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verificationDocName" TEXT,
    "rating" DOUBLE PRECISION DEFAULT 5.0,
    "completedRescues" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ngo_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngo_team_members" (
    "id" TEXT NOT NULL,
    "ngoProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "NGOTeamRole" NOT NULL DEFAULT 'COORDINATOR',
    "status" "NGOTeamMemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ngo_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "addressId" TEXT,
    "serviceAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "transportMethod" "TransportMethod" NOT NULL DEFAULT 'BICYCLE',
    "availability" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "identityDocumentName" TEXT,
    "completedRescues" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "donorProfileId" TEXT NOT NULL,
    "preferredNgoProfileId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "FoodCategory" NOT NULL,
    "dietaryTypes" "DietaryType"[] DEFAULT ARRAY['HALAL']::"DietaryType"[],
    "quantityValue" DOUBLE PRECISION NOT NULL,
    "quantityUnit" "QuantityUnit" NOT NULL DEFAULT 'MEALS',
    "estimatedMeals" INTEGER NOT NULL,
    "preparationTime" TIMESTAMP(3) NOT NULL,
    "safePickupDeadline" TIMESTAMP(3) NOT NULL,
    "storageCondition" "StorageCondition" NOT NULL DEFAULT 'HOT_HOLDING',
    "foodCondition" "FoodCondition" NOT NULL DEFAULT 'FRESHLY_PREPARED',
    "allergens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "photoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "specialInstructions" TEXT,
    "priority" "PriorityLevel" NOT NULL DEFAULT 'HIGH',
    "status" "DonationStatus" NOT NULL DEFAULT 'AVAILABLE',
    "pickupAddressId" TEXT NOT NULL,
    "approximateArea" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "directions" TEXT,
    "safetyFreshlyPrepared" BOOLEAN NOT NULL DEFAULT true,
    "safetyProperlyCovered" BOOLEAN NOT NULL DEFAULT true,
    "safetyNoSpoilage" BOOLEAN NOT NULL DEFAULT true,
    "safetyStoredCorrectly" BOOLEAN NOT NULL DEFAULT true,
    "safetyAllergensDisclosed" BOOLEAN NOT NULL DEFAULT true,
    "safetyDeadlineConfirmed" BOOLEAN NOT NULL DEFAULT true,
    "safetyAccuracyConfirmed" BOOLEAN NOT NULL DEFAULT true,
    "safetyDeclaredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claims" (
    "id" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "ngoProfileId" TEXT NOT NULL,
    "volunteerProfileId" TEXT,
    "status" "ClaimStatus" NOT NULL DEFAULT 'RESERVED',
    "matchScore" INTEGER NOT NULL DEFAULT 90,
    "reservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "distributedAt" TIMESTAMP(3),
    "estimatedPickupAt" TIMESTAMP(3),
    "estimatedDeliveryAt" TIMESTAMP(3),
    "pickupVerificationToken" TEXT,
    "deliveryVerificationToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_requests" (
    "id" TEXT NOT NULL,
    "ngoProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "requestType" "RequestType" NOT NULL DEFAULT 'ONE_TIME',
    "priority" "PriorityLevel" NOT NULL DEFAULT 'HIGH',
    "priorityReason" TEXT,
    "supportingDocumentNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "purpose" TEXT NOT NULL,
    "recipientType" TEXT NOT NULL,
    "categories" "FoodCategory"[] DEFAULT ARRAY[]::"FoodCategory"[],
    "dietaryTypes" "DietaryType"[] DEFAULT ARRAY['HALAL']::"DietaryType"[],
    "specificPreferences" TEXT,
    "allergensOrRestrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "peopleToServe" INTEGER NOT NULL,
    "mealsNeeded" INTEGER NOT NULL,
    "neededWhen" TEXT NOT NULL DEFAULT 'TODAY',
    "neededBy" TIMESTAMP(3) NOT NULL,
    "preferredTimeSlot" TEXT,
    "locationType" TEXT NOT NULL DEFAULT 'SHELTER',
    "deliveryArea" TEXT NOT NULL,
    "deliveryCity" TEXT NOT NULL DEFAULT 'Dhaka',
    "deliveryAddressLine" TEXT NOT NULL,
    "deliveryLandmark" TEXT,
    "deliveryInstructions" TEXT,
    "notes" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_receipts" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "ngoProfileId" TEXT NOT NULL,
    "expectedQuantity" DOUBLE PRECISION NOT NULL,
    "actualQuantity" DOUBLE PRECISION NOT NULL,
    "quantityUnit" "QuantityUnit" NOT NULL DEFAULT 'MEALS',
    "foodCondition" TEXT NOT NULL DEFAULT 'GOOD',
    "quantityMismatchConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "distributionBlocked" BOOLEAN NOT NULL DEFAULT false,
    "verificationMethod" TEXT NOT NULL DEFAULT 'QR',
    "notes" TEXT,
    "photoNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distribution_records" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "ngoProfileId" TEXT NOT NULL,
    "beneficiariesServed" INTEGER NOT NULL,
    "mealsDistributed" INTEGER NOT NULL,
    "adultsServed" INTEGER,
    "childrenServed" INTEGER,
    "distributedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addressId" TEXT NOT NULL,
    "notes" TEXT,
    "photoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "beneficiaryConsentConfirmed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distribution_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "impact_records" (
    "id" TEXT NOT NULL,
    "claimId" TEXT,
    "donorProfileId" TEXT,
    "ngoProfileId" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mealsRescued" INTEGER NOT NULL,
    "foodWeightKg" DOUBLE PRECISION NOT NULL,
    "beneficiariesServed" INTEGER NOT NULL,
    "estimatedCo2PreventedKg" DOUBLE PRECISION NOT NULL,
    "estimatedWaterSavedLitres" DOUBLE PRECISION,
    "estimateMethodology" TEXT NOT NULL,

    CONSTRAINT "impact_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_reports" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "reportedByUserId" TEXT NOT NULL,
    "type" "IncidentType" NOT NULL DEFAULT 'SAFETY_CONCERN',
    "severity" "PriorityLevel" NOT NULL DEFAULT 'HIGH',
    "description" TEXT NOT NULL,
    "evidenceUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredContactMethod" TEXT NOT NULL DEFAULT 'PHONE',
    "status" "IncidentStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "incident_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "priority" "PriorityLevel" NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "href" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "locationPermission" TEXT NOT NULL DEFAULT 'GRANTED',
    "language" TEXT NOT NULL DEFAULT 'BN',
    "textSize" TEXT NOT NULL DEFAULT 'MEDIUM',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_normalizedPhone_key" ON "users"("normalizedPhone");

-- CreateIndex
CREATE INDEX "addresses_ownerId_idx" ON "addresses"("ownerId");

-- CreateIndex
CREATE INDEX "auth_sessions_userId_idx" ON "auth_sessions"("userId");

-- CreateIndex
CREATE INDEX "auth_sessions_expiresAt_idx" ON "auth_sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "donor_profiles_userId_key" ON "donor_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ngo_profiles_userId_key" ON "ngo_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_profiles_userId_key" ON "volunteer_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "claims_donationId_key" ON "claims"("donationId");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_receipts_claimId_key" ON "delivery_receipts"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "distribution_records_claimId_key" ON "distribution_records"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "impact_records_claimId_key" ON "impact_records"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donor_profiles" ADD CONSTRAINT "donor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngo_profiles" ADD CONSTRAINT "ngo_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngo_team_members" ADD CONSTRAINT "ngo_team_members_ngoProfileId_fkey" FOREIGN KEY ("ngoProfileId") REFERENCES "ngo_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_profiles" ADD CONSTRAINT "volunteer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_profiles" ADD CONSTRAINT "volunteer_profiles_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_donorProfileId_fkey" FOREIGN KEY ("donorProfileId") REFERENCES "donor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_pickupAddressId_fkey" FOREIGN KEY ("pickupAddressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "donations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_ngoProfileId_fkey" FOREIGN KEY ("ngoProfileId") REFERENCES "ngo_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "volunteer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_requests" ADD CONSTRAINT "food_requests_ngoProfileId_fkey" FOREIGN KEY ("ngoProfileId") REFERENCES "ngo_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_receipts" ADD CONSTRAINT "delivery_receipts_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_receipts" ADD CONSTRAINT "delivery_receipts_ngoProfileId_fkey" FOREIGN KEY ("ngoProfileId") REFERENCES "ngo_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_records" ADD CONSTRAINT "distribution_records_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_records" ADD CONSTRAINT "distribution_records_ngoProfileId_fkey" FOREIGN KEY ("ngoProfileId") REFERENCES "ngo_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_records" ADD CONSTRAINT "distribution_records_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impact_records" ADD CONSTRAINT "impact_records_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impact_records" ADD CONSTRAINT "impact_records_donorProfileId_fkey" FOREIGN KEY ("donorProfileId") REFERENCES "donor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impact_records" ADD CONSTRAINT "impact_records_ngoProfileId_fkey" FOREIGN KEY ("ngoProfileId") REFERENCES "ngo_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_reportedByUserId_fkey" FOREIGN KEY ("reportedByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

