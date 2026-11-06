import { PrismaClient } from "@prisma/client";
import { createMockAppState } from "../src/data/mock-app-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting ShareBite BD database seeding...");
  const mockState = createMockAppState();

  // 1. Clean existing records in reverse dependency order
  await prisma.userPreference.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.incidentReport.deleteMany();
  await prisma.impactRecord.deleteMany();
  await prisma.distributionRecord.deleteMany();
  await prisma.deliveryReceipt.deleteMany();
  await prisma.foodRequest.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.volunteerProfile.deleteMany();
  await prisma.nGOTeamMember.deleteMany();
  await prisma.nGOProfile.deleteMany();
  await prisma.donorProfile.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
  for (const user of mockState.users) {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role as any,
        isActive: user.isActive,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      },
    });
  }

  // 3. Seed Addresses
  for (const addr of mockState.addresses) {
    await prisma.address.create({
      data: {
        id: addr.id,
        label: addr.label,
        division: addr.division,
        district: addr.district,
        city: addr.city,
        area: addr.area,
        addressLine: addr.addressLine,
        postalCode: addr.postalCode,
        landmark: addr.landmark,
        latitude: addr.coordinates?.latitude,
        longitude: addr.coordinates?.longitude,
        isPrimary: addr.isPrimary,
      },
    });
  }

  // 4. Seed Donor Profiles
  for (const donor of mockState.donorProfiles) {
    await prisma.donorProfile.create({
      data: {
        id: donor.id,
        userId: donor.userId,
        donorType: donor.donorType as any,
        organizationName: donor.organizationName,
        verificationStatus: donor.verificationStatus as any,
        rating: donor.rating,
        totalDonations: donor.totalDonations,
        createdAt: new Date(donor.createdAt),
        updatedAt: new Date(donor.updatedAt),
      },
    });
  }

  // 5. Seed NGO Profiles
  for (const ngo of mockState.ngoProfiles) {
    await prisma.nGOProfile.create({
      data: {
        id: ngo.id,
        userId: ngo.userId,
        organizationName: ngo.organizationName,
        registrationNumber: ngo.registrationNumber,
        summary: ngo.summary,
        mission: ngo.mission,
        vision: ngo.vision,
        values: ngo.values,
        beneficiaryTypes: ngo.beneficiaryTypes,
        acceptedFoodCategories: ngo.acceptedFoodCategories as any,
        authorizedContactUserId: ngo.authorizedContactUserId,
        serviceAreas: ngo.serviceAreas,
        capacityMealsPerDay: ngo.capacityMealsPerDay,
        peopleHelped: ngo.peopleHelped,
        foundedYear: ngo.foundedYear,
        publicEmail: ngo.publicEmail,
        publicPhone: ngo.publicPhone,
        galleryUrls: ngo.galleryUrls,
        verificationStatus: ngo.verificationStatus as any,
        verificationDocName: ngo.verificationDocumentName,
        rating: ngo.rating,
        completedRescues: ngo.completedRescues,
        createdAt: new Date(ngo.createdAt),
        updatedAt: new Date(ngo.updatedAt),
      },
    });
  }

  // 6. Seed Volunteer Profiles
  for (const vol of mockState.volunteerProfiles) {
    await prisma.volunteerProfile.create({
      data: {
        id: vol.id,
        userId: vol.userId,
        addressId: vol.addressId,
        serviceAreas: vol.serviceAreas,
        transportMethod: vol.transportMethod as any,
        availability: vol.availability,
        verificationStatus: vol.verificationStatus as any,
        identityDocumentName: vol.identityDocumentName,
        completedRescues: vol.completedRescues,
        createdAt: new Date(vol.createdAt),
        updatedAt: new Date(vol.updatedAt),
      },
    });
  }

  // 7. Seed Donations
  for (const donation of mockState.donations) {
    await prisma.donation.create({
      data: {
        id: donation.id,
        donorProfileId: donation.donorProfileId,
        preferredNgoProfileId: donation.preferredNgoProfileId,
        title: donation.title,
        description: donation.description,
        category: donation.category as any,
        dietaryTypes: donation.dietaryTypes as any,
        quantityValue: donation.quantity.value,
        quantityUnit: donation.quantity.unit as any,
        estimatedMeals: donation.quantity.estimatedMeals,
        preparationTime: new Date(donation.preparationTime),
        safePickupDeadline: new Date(donation.safePickupDeadline),
        storageCondition: donation.storageCondition as any,
        foodCondition: donation.foodCondition as any,
        allergens: donation.allergens,
        photoUrls: donation.photoUrls,
        specialInstructions: donation.specialInstructions,
        priority: donation.priority as any,
        status: donation.status as any,
        pickupAddressId: donation.pickup.addressId,
        approximateArea: donation.pickup.approximateArea,
        distanceKm: donation.pickup.distanceKm,
        contactName: donation.pickup.contact.name,
        contactPhone: donation.pickup.contact.phone,
        contactEmail: donation.pickup.contact.email,
        windowStart: new Date(donation.pickup.windowStart),
        windowEnd: new Date(donation.pickup.windowEnd),
        directions: donation.pickup.directions,
        safetyFreshlyPrepared: donation.safetyDeclaration.freshlyPrepared,
        safetyProperlyCovered: donation.safetyDeclaration.properlyCovered,
        safetyNoSpoilage: donation.safetyDeclaration.noVisibleSpoilage,
        safetyStoredCorrectly: donation.safetyDeclaration.storedAccordingToDeclaration,
        safetyAllergensDisclosed: donation.safetyDeclaration.allergensDisclosed,
        safetyDeadlineConfirmed: donation.safetyDeclaration.pickupDeadlineConfirmed,
        safetyDeclaredAt: new Date(donation.safetyDeclaration.declaredAt),
        publishedAt: donation.publishedAt ? new Date(donation.publishedAt) : null,
        createdAt: new Date(donation.createdAt),
        updatedAt: new Date(donation.updatedAt),
      },
    });
  }

  // 8. Seed Claims
  for (const claim of mockState.claims) {
    await prisma.claim.create({
      data: {
        id: claim.id,
        donationId: claim.donationId,
        ngoProfileId: claim.ngoProfileId,
        volunteerProfileId: claim.volunteerProfileId,
        status: claim.status as any,
        matchScore: claim.matchScore,
        reservedAt: new Date(claim.reservedAt),
        assignedAt: claim.assignedAt ? new Date(claim.assignedAt) : null,
        pickedUpAt: claim.pickedUpAt ? new Date(claim.pickedUpAt) : null,
        deliveredAt: claim.deliveredAt ? new Date(claim.deliveredAt) : null,
        distributedAt: claim.distributedAt ? new Date(claim.distributedAt) : null,
        estimatedPickupAt: claim.estimatedPickupAt ? new Date(claim.estimatedPickupAt) : null,
        estimatedDeliveryAt: claim.estimatedDeliveryAt ? new Date(claim.estimatedDeliveryAt) : null,
        pickupVerificationToken: claim.pickupVerificationToken,
        deliveryVerificationToken: claim.deliveryVerificationToken,
        createdAt: new Date(claim.reservedAt),
        updatedAt: new Date(claim.updatedAt),
      },
    });
  }

  // 9. Seed Food Requests
  for (const req of mockState.requests) {
    await prisma.foodRequest.create({
      data: {
        id: req.id,
        ngoProfileId: req.ngoProfileId,
        title: req.title,
        requestType: req.requestType as any,
        priority: req.priority as any,
        priorityReason: req.priorityReason,
        supportingDocumentNames: req.supportingDocumentNames,
        purpose: req.purpose,
        recipientType: req.recipientType,
        categories: req.categories as any,
        dietaryTypes: req.dietaryTypes as any,
        specificPreferences: req.specificPreferences,
        allergensOrRestrictions: req.allergensOrRestrictions,
        peopleToServe: req.peopleToServe,
        mealsNeeded: req.mealsNeeded,
        neededWhen: req.neededWhen,
        neededBy: new Date(req.neededBy),
        preferredTimeSlot: req.preferredTimeSlot,
        locationType: req.locationType,
        deliveryArea: req.deliveryLocation.area,
        deliveryCity: req.deliveryLocation.city,
        deliveryAddressLine: req.deliveryLocation.addressLine,
        deliveryLandmark: req.deliveryLocation.landmark,
        deliveryInstructions: req.deliveryLocation.instructions,
        notes: req.notes,
        status: req.status as any,
        createdAt: new Date(req.createdAt),
        updatedAt: new Date(req.updatedAt),
      },
    });
  }

  // 10. Seed Notifications
  for (const notif of mockState.notifications) {
    await prisma.notification.create({
      data: {
        id: notif.id,
        userId: notif.userId,
        type: notif.type as any,
        priority: notif.priority as any,
        title: notif.title,
        message: notif.message,
        href: notif.href,
        readAt: notif.readAt ? new Date(notif.readAt) : null,
        createdAt: new Date(notif.createdAt),
      },
    });
  }

  // 11. Seed Impact Records
  for (const imp of mockState.impactRecords) {
    await prisma.impactRecord.create({
      data: {
        id: imp.id,
        claimId: imp.claimId,
        donorProfileId: imp.donorProfileId,
        ngoProfileId: imp.ngoProfileId,
        recordedAt: new Date(imp.recordedAt),
        mealsRescued: imp.mealsRescued,
        foodWeightKg: imp.foodWeightKg,
        beneficiariesServed: imp.beneficiariesServed,
        estimatedCo2PreventedKg: imp.estimatedCo2PreventedKg,
        estimatedWaterSavedLitres: imp.estimatedWaterSavedLitres,
        estimateMethodology: imp.estimateMethodology,
      },
    });
  }

  console.log("✅ ShareBite BD database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
