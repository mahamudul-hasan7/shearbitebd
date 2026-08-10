import {
  DietaryType,
  FoodCategory,
  NotificationType,
  PriorityLevel,
  QuantityUnit,
  RequestType,
  StorageCondition,
  TransportMethod,
  VerificationStatus,
} from "@/lib/constants/domain";
import { UserRole } from "@/lib/constants/roles";
import { ClaimStatus, DonationStatus, RequestStatus } from "@/lib/constants/statuses";
import type { FoodSafetyDeclaration, MockAppState } from "@/types/domain";

function relativeIso(baseTime: number, minutes: number) {
  return new Date(baseTime + minutes * 60_000).toISOString();
}

function declaration(baseTime: number, userId: string, minutesAgo: number): FoodSafetyDeclaration {
  return {
    freshlyPrepared: true,
    properlyCovered: true,
    noVisibleSpoilage: true,
    storedAccordingToDeclaration: true,
    allergensDisclosed: true,
    pickupDeadlineConfirmed: true,
    donorAccuracyConfirmed: true,
    declaredByUserId: userId,
    declaredAt: relativeIso(baseTime, -minutesAgo),
  };
}

export function createMockAppState(now = new Date()): MockAppState {
  const baseTime = now.getTime();
  const createdSixMonthsAgo = relativeIso(baseTime, -262_800);
  const createdThreeMonthsAgo = relativeIso(baseTime, -131_400);
  const updatedRecently = relativeIso(baseTime, -180);

  return {
    users: [
      { id: "user-donor-uiu", email: "donor@sharebite.demo", displayName: "UIU Cafeteria", phone: "+8801700000001", role: UserRole.DONOR, isActive: true, createdAt: createdSixMonthsAgo, updatedAt: updatedRecently },
      { id: "user-donor-badda", email: "badda.bites@example.test", displayName: "Badda Bites", phone: "+8801700000002", role: UserRole.DONOR, isActive: true, createdAt: createdSixMonthsAgo, updatedAt: updatedRecently },
      { id: "user-donor-banani", email: "bread.house@example.test", displayName: "Banani Bread House", phone: "+8801700000003", role: UserRole.DONOR, isActive: true, createdAt: createdThreeMonthsAgo, updatedAt: updatedRecently },
      { id: "user-ngo-hope", email: "ngo@sharebite.demo", displayName: "Hope Foundation", phone: "+8801700000011", role: UserRole.NGO, isActive: true, createdAt: createdSixMonthsAgo, updatedAt: updatedRecently },
      { id: "user-ngo-kitchen", email: "community.kitchen@example.test", displayName: "Dhaka Community Kitchen", phone: "+8801700000012", role: UserRole.NGO, isActive: true, createdAt: createdThreeMonthsAgo, updatedAt: updatedRecently },
      { id: "user-volunteer-demo", email: "volunteer@sharebite.demo", displayName: "Demo Volunteer", phone: "+8801700000021", role: UserRole.VOLUNTEER, isActive: true, createdAt: createdThreeMonthsAgo, updatedAt: updatedRecently },
    ],
    addresses: [
      { id: "address-uiu", label: "UIU Cafeteria pickup", division: "Dhaka", district: "Dhaka", city: "Dhaka", area: "Badda", addressLine: "Mock campus gate, United City", postalCode: "1212", landmark: "Near Madani Avenue", coordinates: { latitude: 23.7976, longitude: 90.4496 }, isPrimary: true },
      { id: "address-badda-bites", label: "Badda Bites kitchen", division: "Dhaka", district: "Dhaka", city: "Dhaka", area: "Middle Badda", addressLine: "Mock restaurant lane, Middle Badda", postalCode: "1212", landmark: "Beside the community market", coordinates: { latitude: 23.7804, longitude: 90.4264 }, isPrimary: true },
      { id: "address-banani-bread", label: "Banani Bread House", division: "Dhaka", district: "Dhaka", city: "Dhaka", area: "Banani", addressLine: "Mock bakery road, Banani", postalCode: "1213", landmark: "Near the playground", coordinates: { latitude: 23.7937, longitude: 90.4066 }, isPrimary: true },
      { id: "address-hope", label: "Hope Foundation center", division: "Dhaka", district: "Dhaka", city: "Dhaka", area: "Rampura", addressLine: "Mock service center, Rampura", postalCode: "1219", landmark: "Behind the community hall", coordinates: { latitude: 23.7614, longitude: 90.4208 }, isPrimary: true },
      { id: "address-community-kitchen", label: "Dhaka Community Kitchen", division: "Dhaka", district: "Dhaka", city: "Dhaka", area: "Mohammadpur", addressLine: "Mock distribution center, Mohammadpur", postalCode: "1207", landmark: "Near Town Hall", coordinates: { latitude: 23.7578, longitude: 90.3586 }, isPrimary: true },
      { id: "address-volunteer", label: "Volunteer home area", division: "Dhaka", district: "Dhaka", city: "Dhaka", area: "Gulshan", addressLine: "Private mock volunteer address", postalCode: "1212", coordinates: { latitude: 23.7925, longitude: 90.4078 }, isPrimary: true },
    ],
    donorProfiles: [
      { id: "donor-uiu", userId: "user-donor-uiu", donorType: "CAFETERIA", organizationName: "UIU Cafeteria", addressIds: ["address-uiu"], verificationStatus: VerificationStatus.VERIFIED, rating: 4.9, totalDonations: 48, createdAt: createdSixMonthsAgo, updatedAt: updatedRecently },
      { id: "donor-badda", userId: "user-donor-badda", donorType: "RESTAURANT", organizationName: "Badda Bites", addressIds: ["address-badda-bites"], verificationStatus: VerificationStatus.VERIFIED, rating: 4.7, totalDonations: 31, createdAt: createdSixMonthsAgo, updatedAt: updatedRecently },
      { id: "donor-banani", userId: "user-donor-banani", donorType: "BAKERY", organizationName: "Banani Bread House", addressIds: ["address-banani-bread"], verificationStatus: VerificationStatus.VERIFIED, rating: 4.8, totalDonations: 22, createdAt: createdThreeMonthsAgo, updatedAt: updatedRecently },
    ],
    ngoProfiles: [
      { id: "ngo-hope", userId: "user-ngo-hope", organizationName: "Hope Foundation", registrationNumber: "MOCK-NGO-1024", beneficiaryTypes: ["Shelter", "Families"], authorizedContactUserId: "user-ngo-hope", addressIds: ["address-hope"], serviceAreas: ["Badda", "Rampura", "Gulshan"], capacityMealsPerDay: 350, verificationStatus: VerificationStatus.VERIFIED, verificationDocumentName: "mock-hope-registration.pdf", rating: 4.9, completedRescues: 64, createdAt: createdSixMonthsAgo, updatedAt: updatedRecently },
      { id: "ngo-community-kitchen", userId: "user-ngo-kitchen", organizationName: "Dhaka Community Kitchen", registrationNumber: "MOCK-NGO-2048", beneficiaryTypes: ["Community center", "Street outreach"], authorizedContactUserId: "user-ngo-kitchen", addressIds: ["address-community-kitchen"], serviceAreas: ["Mohammadpur", "Dhanmondi", "Farmgate"], capacityMealsPerDay: 500, verificationStatus: VerificationStatus.VERIFIED, verificationDocumentName: "mock-community-kitchen-registration.pdf", rating: 4.8, completedRescues: 51, createdAt: createdThreeMonthsAgo, updatedAt: updatedRecently },
    ],
    volunteerProfiles: [
      { id: "volunteer-demo", userId: "user-volunteer-demo", addressId: "address-volunteer", serviceAreas: ["Gulshan", "Badda", "Banani", "Rampura"], transportMethod: TransportMethod.MOTORCYCLE, availability: ["Evenings", "Weekends"], verificationStatus: VerificationStatus.VERIFIED, identityDocumentName: "mock-volunteer-id.pdf", completedRescues: 18, createdAt: createdThreeMonthsAgo, updatedAt: updatedRecently },
    ],
    donations: [
      {
        id: "donation-uiu-lunch",
        donorProfileId: "donor-uiu",
        title: "Rice, chicken curry, and vegetables",
        description: "Freshly prepared lunch portions remaining after the campus service window.",
        category: FoodCategory.COOKED_MEAL,
        dietaryTypes: [DietaryType.HALAL, DietaryType.CONTAINS_MEAT],
        quantity: { value: 42, unit: QuantityUnit.MEALS, estimatedMeals: 42 },
        preparationTime: relativeIso(baseTime, -90),
        safePickupDeadline: relativeIso(baseTime, 150),
        storageCondition: StorageCondition.HOT_HOLDING,
        foodCondition: "FRESHLY_PREPARED",
        allergens: ["Milk"],
        photoUrls: ["/images/donor-active-meal.png"],
        specialInstructions: "Bring insulated carriers and collect all trays together.",
        pickup: { addressId: "address-uiu", approximateArea: "Badda, Dhaka", distanceKm: 3.2, contact: { name: "UIU Cafeteria Desk", phone: "+8801700000001", email: "donor@sharebite.demo" }, windowStart: relativeIso(baseTime, 30), windowEnd: relativeIso(baseTime, 120), directions: "Use the designated mock pickup gate and ask for the cafeteria desk." },
        safetyDeclaration: declaration(baseTime, "user-donor-uiu", 40),
        priority: PriorityLevel.HIGH,
        status: DonationStatus.ASSIGNED,
        publishedAt: relativeIso(baseTime, -35),
        createdAt: relativeIso(baseTime, -50),
        updatedAt: relativeIso(baseTime, -5),
      },
      {
        id: "donation-banani-bread",
        donorProfileId: "donor-banani",
        title: "Assorted bread and buns",
        description: "Same-day packaged bread, rolls, and buns from the evening batch.",
        category: FoodCategory.BAKERY,
        dietaryTypes: [DietaryType.HALAL, DietaryType.VEGETARIAN],
        quantity: { value: 55, unit: QuantityUnit.PACKETS, estimatedMeals: 70 },
        preparationTime: relativeIso(baseTime, -240),
        safePickupDeadline: relativeIso(baseTime, 360),
        storageCondition: StorageCondition.AMBIENT,
        foodCondition: "SAME_DAY",
        allergens: ["Gluten", "Milk", "Egg"],
        photoUrls: ["/mock/food/bakery-pack.jpg"],
        pickup: { addressId: "address-banani-bread", approximateArea: "Banani, Dhaka", distanceKm: 5.7, contact: { name: "Bakery Dispatch", phone: "+8801700000003" }, windowStart: relativeIso(baseTime, 90), windowEnd: relativeIso(baseTime, 300), directions: "Use the service counter after showing the mock claim ID." },
        safetyDeclaration: declaration(baseTime, "user-donor-banani", 65),
        priority: PriorityLevel.MEDIUM,
        status: DonationStatus.RESERVED,
        publishedAt: relativeIso(baseTime, -60),
        createdAt: relativeIso(baseTime, -80),
        updatedAt: relativeIso(baseTime, -15),
      },
      {
        id: "donation-badda-biryani",
        donorProfileId: "donor-badda",
        title: "Chicken biryani portions",
        description: "Covered restaurant trays prepared for a cancelled group booking.",
        category: FoodCategory.COOKED_MEAL,
        dietaryTypes: [DietaryType.HALAL, DietaryType.CONTAINS_MEAT],
        quantity: { value: 28, unit: QuantityUnit.MEALS, estimatedMeals: 28 },
        preparationTime: relativeIso(baseTime, -120),
        safePickupDeadline: relativeIso(baseTime, 105),
        storageCondition: StorageCondition.HOT_HOLDING,
        foodCondition: "FRESHLY_PREPARED",
        allergens: ["Milk"],
        photoUrls: ["/mock/food/biryani-trays.jpg"],
        pickup: { addressId: "address-badda-bites", approximateArea: "Middle Badda, Dhaka", distanceKm: 2.4, contact: { name: "Badda Bites Dispatch", phone: "+8801700000002" }, windowStart: relativeIso(baseTime, 20), windowEnd: relativeIso(baseTime, 90), directions: "Pickup is at the rear mock service entrance." },
        safetyDeclaration: declaration(baseTime, "user-donor-badda", 35),
        priority: PriorityLevel.URGENT,
        status: DonationStatus.ASSIGNED,
        publishedAt: relativeIso(baseTime, -45),
        createdAt: relativeIso(baseTime, -55),
        updatedAt: relativeIso(baseTime, -5),
      },
      {
        id: "donation-uiu-produce",
        donorProfileId: "donor-uiu",
        title: "Seasonal fruit and vegetables",
        description: "Uncut produce sorted into reusable crates for community distribution.",
        category: FoodCategory.PRODUCE,
        dietaryTypes: [DietaryType.VEGAN, DietaryType.GLUTEN_FREE],
        quantity: { value: 24, unit: QuantityUnit.KILOGRAMS, estimatedMeals: 48 },
        preparationTime: relativeIso(baseTime, -1_560),
        safePickupDeadline: relativeIso(baseTime, -720),
        storageCondition: StorageCondition.AMBIENT,
        foodCondition: "PACKAGED",
        allergens: [],
        photoUrls: ["/mock/food/produce-crates.jpg"],
        pickup: { addressId: "address-uiu", approximateArea: "Badda, Dhaka", distanceKm: 3.2, contact: { name: "UIU Cafeteria Desk", phone: "+8801700000001" }, windowStart: relativeIso(baseTime, -1_400), windowEnd: relativeIso(baseTime, -900) },
        safetyDeclaration: declaration(baseTime, "user-donor-uiu", 1_500),
        priority: PriorityLevel.MEDIUM,
        status: DonationStatus.DISTRIBUTED,
        publishedAt: relativeIso(baseTime, -1_500),
        createdAt: relativeIso(baseTime, -1_520),
        updatedAt: relativeIso(baseTime, -600),
      },
      {
        id: "donation-badda-draft",
        donorProfileId: "donor-badda",
        title: "Packaged pantry items",
        description: "Draft listing for sealed rice, lentils, and cooking oil packs.",
        category: FoodCategory.GROCERIES,
        dietaryTypes: [DietaryType.HALAL, DietaryType.VEGAN],
        quantity: { value: 16, unit: QuantityUnit.PACKETS, estimatedMeals: 40 },
        preparationTime: relativeIso(baseTime, -60),
        safePickupDeadline: relativeIso(baseTime, 1_440),
        storageCondition: StorageCondition.AMBIENT,
        foodCondition: "PACKAGED",
        allergens: [],
        photoUrls: [],
        pickup: { addressId: "address-badda-bites", approximateArea: "Middle Badda, Dhaka", contact: { name: "Badda Bites Dispatch", phone: "+8801700000002" }, windowStart: relativeIso(baseTime, 600), windowEnd: relativeIso(baseTime, 1_200) },
        safetyDeclaration: declaration(baseTime, "user-donor-badda", 20),
        priority: PriorityLevel.LOW,
        status: DonationStatus.DRAFT,
        createdAt: relativeIso(baseTime, -25),
        updatedAt: relativeIso(baseTime, -25),
      },
    ],
    claims: [
      { id: "claim-uiu-lunch", donationId: "donation-uiu-lunch", ngoProfileId: "ngo-hope", volunteerProfileId: "volunteer-demo", status: ClaimStatus.ASSIGNED, matchScore: 96, reservedAt: relativeIso(baseTime, -25), assignedAt: relativeIso(baseTime, -5), estimatedPickupAt: relativeIso(baseTime, 45), estimatedDeliveryAt: relativeIso(baseTime, 95), pickupVerificationToken: "MOCK-PICKUP-624819", deliveryVerificationToken: "MOCK-DELIVERY-381507", updatedAt: relativeIso(baseTime, -5) },
      { id: "claim-banani-bread", donationId: "donation-banani-bread", ngoProfileId: "ngo-community-kitchen", status: ClaimStatus.RESERVED, matchScore: 86, reservedAt: relativeIso(baseTime, -15), estimatedPickupAt: relativeIso(baseTime, 150), updatedAt: relativeIso(baseTime, -15) },
      { id: "claim-badda-biryani", donationId: "donation-badda-biryani", ngoProfileId: "ngo-hope", volunteerProfileId: "volunteer-demo", status: ClaimStatus.ASSIGNED, matchScore: 94, reservedAt: relativeIso(baseTime, -30), assignedAt: relativeIso(baseTime, -5), estimatedPickupAt: relativeIso(baseTime, 35), estimatedDeliveryAt: relativeIso(baseTime, 80), pickupVerificationToken: "MOCK-PICKUP-482913", deliveryVerificationToken: "MOCK-DELIVERY-735204", updatedAt: relativeIso(baseTime, -5) },
      { id: "claim-uiu-produce", donationId: "donation-uiu-produce", ngoProfileId: "ngo-hope", volunteerProfileId: "volunteer-demo", status: ClaimStatus.DISTRIBUTED, matchScore: 91, reservedAt: relativeIso(baseTime, -1_440), assignedAt: relativeIso(baseTime, -1_380), pickedUpAt: relativeIso(baseTime, -1_200), deliveredAt: relativeIso(baseTime, -1_020), distributedAt: relativeIso(baseTime, -600), updatedAt: relativeIso(baseTime, -600) },
    ],
    requests: [
      { id: "request-hope-family-meals", ngoProfileId: "ngo-hope", title: "Evening meals for shelter families", requestType: RequestType.ONE_TIME, priority: PriorityLevel.HIGH, priorityReason: "The regular meal sponsor is unavailable today.", purpose: "Evening meal support", recipientType: "Families", categories: [FoodCategory.COOKED_MEAL, FoodCategory.BAKERY], dietaryTypes: [DietaryType.HALAL], allergensOrRestrictions: ["Clearly label milk and nut allergens"], peopleToServe: 80, mealsNeeded: 80, neededBy: relativeIso(baseTime, 600), preferredTimeSlot: "6:00 PM - 8:00 PM", deliveryAddressId: "address-hope", locationType: "SHELTER", notes: "Portions suitable for adults and children are welcome.", status: RequestStatus.FINDING_MATCH, createdAt: relativeIso(baseTime, -200), updatedAt: relativeIso(baseTime, -120) },
      { id: "request-community-weekend", ngoProfileId: "ngo-community-kitchen", title: "Weekend community lunch supplies", requestType: RequestType.RECURRING, priority: PriorityLevel.MEDIUM, purpose: "Community lunch preparation", recipientType: "Community outreach", categories: [FoodCategory.GROCERIES, FoodCategory.PRODUCE], dietaryTypes: [DietaryType.HALAL, DietaryType.VEGETARIAN], allergensOrRestrictions: [], peopleToServe: 150, mealsNeeded: 150, neededBy: relativeIso(baseTime, 2_880), preferredTimeSlot: "Friday morning", deliveryAddressId: "address-community-kitchen", locationType: "COMMUNITY_CENTER", status: RequestStatus.PENDING_REVIEW, createdAt: relativeIso(baseTime, -90), updatedAt: relativeIso(baseTime, -90) },
    ],
    notifications: [
      { id: "notification-uiu-published", userId: "user-donor-uiu", type: NotificationType.VOLUNTEER, priority: PriorityLevel.HIGH, title: "Volunteer assigned", message: "A verified volunteer is scheduled to collect your lunch donation.", href: "/donor/donations/donation-uiu-lunch/tracking", createdAt: relativeIso(baseTime, -5) },
      { id: "notification-donor-claim", userId: "user-donor-badda", type: NotificationType.CLAIM, priority: PriorityLevel.HIGH, title: "Donation assigned", message: "A verified volunteer was assigned to the biryani rescue.", href: "/donor/donations/donation-badda-biryani", createdAt: relativeIso(baseTime, -5) },
      { id: "notification-ngo-nearby", userId: "user-ngo-hope", type: NotificationType.NEARBY_DONATION, priority: PriorityLevel.HIGH, title: "Nearby food is available", message: "42 lunch portions are available in the Badda area.", href: "/ngo/donations/donation-uiu-lunch", createdAt: relativeIso(baseTime, -20) },
      { id: "notification-volunteer-pickup", userId: "user-volunteer-demo", type: NotificationType.PICKUP, priority: PriorityLevel.URGENT, title: "Pickup assignment ready", message: "Collect the assigned biryani donation within the safe pickup window.", href: "/ngo/claims/claim-badda-biryani", createdAt: relativeIso(baseTime, -5) },
      { id: "notification-ngo-impact", userId: "user-ngo-hope", type: NotificationType.IMPACT, priority: PriorityLevel.LOW, title: "Impact record added", message: "The produce distribution added 48 rescued meals to your mock impact history.", href: "/ngo/impact", createdAt: relativeIso(baseTime, -580), readAt: relativeIso(baseTime, -540) },
    ],
    impactRecords: [
      { id: "impact-uiu-produce", claimId: "claim-uiu-produce", donorProfileId: "donor-uiu", ngoProfileId: "ngo-hope", recordedAt: relativeIso(baseTime, -600), mealsRescued: 48, foodWeightKg: 24, beneficiariesServed: 44, estimatedCo2PreventedKg: 60, estimatedWaterSavedLitres: 6_000, estimateMethodology: "Frontend estimate using configurable meal and food-weight factors; not a measured environmental result." },
      { id: "impact-uiu-community", donorProfileId: "donor-uiu", ngoProfileId: "ngo-community-kitchen", recordedAt: relativeIso(baseTime, -5_760), mealsRescued: 36, foodWeightKg: 18, beneficiariesServed: 33, estimatedCo2PreventedKg: 45, estimatedWaterSavedLitres: 4_500, estimateMethodology: "Frontend estimate using configurable meal and food-weight factors; not a measured environmental result." },
      { id: "impact-badda-month", donorProfileId: "donor-badda", ngoProfileId: "ngo-community-kitchen", recordedAt: relativeIso(baseTime, -10_080), mealsRescued: 36, foodWeightKg: 18, beneficiariesServed: 34, estimatedCo2PreventedKg: 45, estimateMethodology: "Frontend estimate using configurable meal and food-weight factors; not a measured environmental result." },
      { id: "impact-banani-month", donorProfileId: "donor-banani", ngoProfileId: "ngo-hope", recordedAt: relativeIso(baseTime, -20_160), mealsRescued: 62, foodWeightKg: 21, beneficiariesServed: 58, estimatedCo2PreventedKg: 52.5, estimateMethodology: "Frontend estimate using configurable meal and food-weight factors; not a measured environmental result." },
    ],
    incidentReports: [],
    distributionRecords: [
      { id: "distribution-uiu-produce", claimId: "claim-uiu-produce", ngoProfileId: "ngo-hope", beneficiariesServed: 44, mealsDistributed: 48, adultsServed: 31, childrenServed: 13, distributedAt: relativeIso(baseTime, -600), addressId: "address-hope", notes: "Distributed in reusable produce bags during the evening service.", photoUrls: ["/mock/distribution/produce-bags.jpg"], beneficiaryConsentConfirmed: true, createdAt: relativeIso(baseTime, -595) },
    ],
  };
}

export const mockDataReference = {
  donorProfileId: "donor-uiu",
  ngoProfileId: "ngo-hope",
  volunteerProfileId: "volunteer-demo",
  activeDonationId: "donation-uiu-lunch",
  activeClaimId: "claim-uiu-lunch",
} as const;
