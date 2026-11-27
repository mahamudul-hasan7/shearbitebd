import { loadDatabaseEnv } from "./database-env.mjs";

async function main() {
  loadDatabaseEnv();
  const { prisma } = await import("../src/lib/prisma");

  try {
    const donorUser = await prisma.user.findUnique({
      where: { email: "donor@sharebite.demo" },
      include: { donorProfile: true, addresses: true },
    });
    const ngoUser = await prisma.user.findUnique({
      where: { email: "ngo@sharebite.demo" },
      include: { ngoProfile: true, addresses: true },
    });
    const volUser = await prisma.user.findUnique({
      where: { email: "volunteer@sharebite.demo" },
      include: { volunteerProfile: true },
    });

    if (!donorUser?.donorProfile || !ngoUser?.ngoProfile || !volUser?.volunteerProfile) {
      console.log("Demo accounts not found; run npm run db:seed first.");
      return;
    }

    const donorAddr = donorUser.addresses[0] ?? (await prisma.address.create({
      data: {
        ownerId: donorUser.id,
        label: "UIU Central Cafeteria",
        area: "United City, Madani Ave, Badda",
        addressLine: "United International University, Madani Avenue, Badda, Dhaka 1212",
        latitude: 23.7979,
        longitude: 90.4496,
        isPrimary: true,
      },
    }));

    if (!donorAddr.latitude || !donorAddr.longitude) {
      await prisma.address.update({
        where: { id: donorAddr.id },
        data: { latitude: 23.7979, longitude: 90.4496 },
      });
    }

    const ngoAddr = ngoUser.addresses[0] ?? (await prisma.address.create({
      data: {
        ownerId: ngoUser.id,
        label: "Hope & Mastul Shelter",
        area: "Badda Link Road, Gulshan-1",
        addressLine: "House 14, Road 3, Badda Link Road, Dhaka 1212",
        latitude: 23.7805,
        longitude: 90.4262,
        isPrimary: true,
      },
    }));

    if (!ngoAddr.latitude || !ngoAddr.longitude) {
      await prisma.address.update({
        where: { id: ngoAddr.id },
        data: { latitude: 23.7805, longitude: 90.4262 },
      });
    }

    const existingShowcase = await prisma.donation.findUnique({
      where: { id: "don_showcase_dist_1" },
    });

    if (!existingShowcase) {
      const now = Date.now();
      const historyPoints = [
        { id: "don_showcase_dist_1", daysAgo: 6, title: "UIU Convocation Biryani Packs", meals: 85 },
        { id: "don_showcase_dist_2", daysAgo: 4, title: "Cafeteria Rice & Chicken Curry Trays", meals: 60 },
        { id: "don_showcase_dist_3", daysAgo: 2, title: "Fresh Bakery & Sandwich Boxes", meals: 45 },
        { id: "don_showcase_dist_4", daysAgo: 1, title: "Evening Iftar & Polao Surplus", meals: 95 },
      ];

      for (const item of historyPoints) {
        const created = new Date(now - item.daysAgo * 86_400_000);
        const deadline = new Date(created.getTime() + 3 * 3_600_000);
        await prisma.donation.create({
          data: {
            id: item.id,
            donorProfileId: donorUser.donorProfile.id,
            title: item.title,
            description: "Freshly prepared surplus meals sealed in food-grade insulated containers.",
            category: "COOKED_MEAL",
            dietaryTypes: ["HALAL"],
            quantityValue: item.meals,
            quantityUnit: "MEALS",
            estimatedMeals: item.meals,
            preparationTime: new Date(created.getTime() - 1_800_000),
            safePickupDeadline: deadline,
            storageCondition: "HOT_HOLDING",
            foodCondition: "FRESHLY_PREPARED",
            sampleImageId: "packed-meals",
            priority: "HIGH",
            status: "DISTRIBUTED",
            pickupLatitude: 23.7979,
            pickupLongitude: 90.4496,
            pickupAddressId: donorAddr.id,
            approximateArea: "Badda, Dhaka",
            contactName: donorUser.displayName,
            contactPhone: donorUser.phone || "01711000001",
            windowStart: created,
            windowEnd: deadline,
            publishedAt: created,
            createdAt: created,
          },
        });

        const claimId = `clm_${item.id}`;
        await prisma.claim.create({
          data: {
            id: claimId,
            donationId: item.id,
            ngoProfileId: ngoUser.ngoProfile.id,
            volunteerProfileId: volUser.volunteerProfile.id,
            status: "DISTRIBUTED",
            routeStage: "completed",
            reservedAt: created,
            assignedAt: new Date(created.getTime() + 300_000),
            pickedUpAt: new Date(created.getTime() + 900_000),
            deliveredAt: new Date(created.getTime() + 1_800_000),
            distributedAt: new Date(created.getTime() + 2_400_000),
            deliveryAddressSnapshot: {
              id: ngoAddr.id,
              label: ngoAddr.label,
              area: ngoAddr.area,
              addressLine: ngoAddr.addressLine,
              coordinates: { latitude: 23.7805, longitude: 90.4262 },
            },
          },
        });

        await prisma.deliveryReceipt.create({
          data: {
            claimId,
            ngoProfileId: ngoUser.ngoProfile.id,
            expectedQuantity: item.meals,
            actualQuantity: item.meals,
            quantityUnit: "MEALS",
            foodCondition: "GOOD",
            verificationMethod: "OTP",
            receivedAt: new Date(created.getTime() + 1_800_000),
          },
        });

        await prisma.distributionRecord.create({
          data: {
            claimId,
            ngoProfileId: ngoUser.ngoProfile.id,
            beneficiariesServed: item.meals,
            mealsDistributed: item.meals,
            distributedAt: new Date(created.getTime() + 2_400_000),
            addressId: ngoAddr.id,
          },
        });

        await prisma.impactRecord.create({
          data: {
            claimId,
            donorProfileId: donorUser.donorProfile.id,
            ngoProfileId: ngoUser.ngoProfile.id,
            recordedAt: new Date(created.getTime() + 2_400_000),
            mealsRescued: item.meals,
            foodWeightKg: Number((item.meals * 0.45).toFixed(1)),
            beneficiariesServed: item.meals,
            estimatedCo2PreventedKg: Number((item.meals * 1.25).toFixed(1)),
            estimatedWaterSavedLitres: item.meals * 125,
            estimateMethodology: "EPA/FAO food waste proxy model (1.25 kg CO2e & 125 L water per meal)",
          },
        });
      }

      // Create one live AVAILABLE listing for NGO Discovery / Map
      const futureStart = new Date(now - 600_000);
      const futureDeadline = new Date(now + 4 * 3_600_000);
      await prisma.donation.create({
        data: {
          id: "don_showcase_avail_1",
          donorProfileId: donorUser.donorProfile.id,
          title: "Fresh Kacchi & Roast Banquet Trays",
          description: "Surplus sealed banquet trays from UIU Auditorium seminar lunch. Hot-held above 60°C.",
          category: "COOKED_MEAL",
          dietaryTypes: ["HALAL"],
          quantityValue: 55,
          quantityUnit: "MEALS",
          estimatedMeals: 55,
          preparationTime: new Date(now - 1_800_000),
          safePickupDeadline: futureDeadline,
          storageCondition: "HOT_HOLDING",
          foodCondition: "FRESHLY_PREPARED",
          sampleImageId: "meal-trays",
          priority: "URGENT",
          status: "AVAILABLE",
          pickupLatitude: 23.7979,
          pickupLongitude: 90.4496,
          pickupAddressId: donorAddr.id,
          approximateArea: "Badda, Dhaka",
          contactName: donorUser.displayName,
          contactPhone: donorUser.phone || "01711000001",
          windowStart: futureStart,
          windowEnd: futureDeadline,
          publishedAt: futureStart,
        },
      });

      // Create one active ASSIGNED rescue for live OTP + QR + OSRM Route Map testing
      await prisma.donation.create({
        data: {
          id: "don_showcase_active_1",
          donorProfileId: donorUser.donorProfile.id,
          title: "UIU Cafeteria Lunch Packs (65 Meals)",
          description: "Steamed rice, chicken curry, and lentil packs ready at Gate 1.",
          category: "COOKED_MEAL",
          dietaryTypes: ["HALAL"],
          quantityValue: 65,
          quantityUnit: "MEALS",
          estimatedMeals: 65,
          preparationTime: new Date(now - 1_200_000),
          safePickupDeadline: futureDeadline,
          storageCondition: "HOT_HOLDING",
          foodCondition: "FRESHLY_PREPARED",
          sampleImageId: "packed-meals",
          priority: "HIGH",
          status: "ASSIGNED",
          pickupLatitude: 23.7979,
          pickupLongitude: 90.4496,
          pickupAddressId: donorAddr.id,
          approximateArea: "Badda, Dhaka",
          contactName: donorUser.displayName,
          contactPhone: donorUser.phone || "01711000001",
          windowStart: futureStart,
          windowEnd: futureDeadline,
          publishedAt: futureStart,
        },
      });

      await prisma.claim.create({
        data: {
          id: "clm_showcase_active_1",
          donationId: "don_showcase_active_1",
          ngoProfileId: ngoUser.ngoProfile.id,
          volunteerProfileId: volUser.volunteerProfile.id,
          status: "ASSIGNED",
          routeStage: "en_route_pickup",
          reservedAt: new Date(now - 900_000),
          assignedAt: new Date(now - 600_000),
          deliveryAddressSnapshot: {
            id: ngoAddr.id,
            label: ngoAddr.label,
            area: ngoAddr.area,
            addressLine: ngoAddr.addressLine,
            coordinates: { latitude: 23.7805, longitude: 90.4262 },
          },
        },
      });

      await prisma.volunteerProfile.update({
        where: { id: volUser.volunteerProfile.id },
        data: { isOnDuty: true, completedRescues: 4 },
      });

      console.log("Showcase seed data inserted successfully.");
    } else {
      const freshDeadline = new Date(Date.now() + 6 * 3_600_000);
      await prisma.donation.updateMany({
        where: { id: { in: ["don_showcase_avail_1", "don_showcase_active_1"] } },
        data: { safePickupDeadline: freshDeadline, windowEnd: freshDeadline },
      });
      console.log("Showcase seed data refreshed.");
    }

    const existingReq = await prisma.foodRequest.findUnique({
      where: { id: "req_showcase_badda" },
    });
    if (!existingReq) {
      const tomorrow = new Date(Date.now() + 24 * 3_600_000);
      const requests = [
        { id: "req_showcase_badda", area: "Badda, Dhaka", line: "Badda Link Road Shelter", meals: 140, title: "Daily Shelter Dinner Request (Badda)" },
        { id: "req_showcase_dhanmondi", area: "Dhanmondi 27, Dhaka", line: "Dhanmondi Road 27 Community Hub", meals: 90, title: "Children Shelter Lunch Support" },
        { id: "req_showcase_mirpur", area: "Mirpur 10, Dhaka", line: "Mirpur Section 10 Welfare Center", meals: 115, title: "Evening Community Kitchen Meals" },
      ];
      for (const req of requests) {
        await prisma.foodRequest.create({
          data: {
            id: req.id,
            ngoProfileId: ngoUser.ngoProfile.id,
            deliveryAddressId: ngoAddr.id,
            title: req.title,
            purpose: "Community shelter meal distribution",
            recipientType: "SHELTER_RESIDENTS",
            categories: ["COOKED_MEAL"],
            peopleToServe: req.meals,
            mealsNeeded: req.meals,
            neededBy: tomorrow,
            deliveryArea: req.area,
            deliveryAddressLine: req.line,
            status: "FINDING_MATCH",
          },
        });
      }
      console.log("Showcase food requests inserted.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
