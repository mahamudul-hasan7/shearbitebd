import { sampleDonationImage } from "@/lib/sample-donation-images";
import { requestAddress } from "@/lib/db/locations";
import { coordinates } from "@/lib/locations";
import { Prisma, FoodCategory, DietaryType, QuantityUnit, StorageCondition, FoodCondition, PriorityLevel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError, object, textField } from "@/lib/api";
import type { AuthAccount } from "@/lib/db/accounts";
import { addressDto } from "@/lib/db/profile";
import { createDonationView } from "@/lib/permissions/permissions";
import { validateDonationTimes } from "@/lib/validators/date-time";
import { validateBangladeshPhone } from "@/features/auth/validation";
import type { Claim, Donation, ViewerContext } from "@/types/domain";
import { attachPhotos } from "@/lib/db/photos";
import { refreshRequestProgress } from "@/lib/db/request-progress";
import { requestMatch } from "@/lib/db/request-matching";

export const donationInclude = {
  pickupAddress: true, donor: { include: { user: true } },
  claims: { orderBy: { reservedAt: "desc" }, include: { ngo: { include: { user: true } }, volunteer: { include: { user: true } } } },
} satisfies Prisma.DonationInclude;
export type DonationRow = Prisma.DonationGetPayload<{ include: typeof donationInclude }>;

export function viewerFor(user: AuthAccount): ViewerContext {
  return { userId: user.id, role: user.role, donorProfileId: user.donorProfileId, ngoProfileId: user.ngoProfileId, volunteerProfileId: user.volunteerProfileId };
}

export function claimDto(row: DonationRow["claims"][number]): Claim {
  // Verification tokens are deliberately excluded from general claim responses.
  const { id, donationId, ngoProfileId, volunteerProfileId, status, routeStage, foodRequestId, requestMealsAllocated, matchScore, reservedAt, assignedAt, pickedUpAt, deliveredAt, distributedAt, estimatedPickupAt, estimatedDeliveryAt, updatedAt } = row;
  return JSON.parse(JSON.stringify({ id, donationId, ngoProfileId, volunteerProfileId: volunteerProfileId ?? undefined, status, routeStage, foodRequestId: foodRequestId || undefined, requestMealsAllocated, matchScore, reservedAt, assignedAt, pickedUpAt, deliveredAt, distributedAt, estimatedPickupAt, estimatedDeliveryAt, updatedAt })) as Claim;
}

export function donationDto(row: DonationRow, user: AuthAccount) {
  const value = {
    id: row.id, donorProfileId: row.donorProfileId, preferredNgoProfileId: row.preferredNgoProfileId ?? undefined,
    title: row.title, description: row.description, category: row.category, dietaryTypes: row.dietaryTypes,
    quantity: { value: row.quantityValue, unit: row.quantityUnit, estimatedMeals: row.estimatedMeals },
    preparationTime: row.preparationTime, safePickupDeadline: row.safePickupDeadline,
    storageCondition: row.storageCondition, foodCondition: row.foodCondition, allergens: row.allergens, photoUrls: row.photoUrls, sampleImageId: row.sampleImageId || undefined,
    specialInstructions: row.specialInstructions ?? undefined, priority: row.priority, status: row.status,
    pickup: { addressId: row.pickupAddressId, approximateArea: row.approximateArea, distanceKm: undefined,
      contact: { name: row.contactName, phone: row.contactPhone, email: row.contactEmail ?? undefined }, windowStart: row.windowStart, windowEnd: row.windowEnd, directions: row.directions ?? undefined },
    safetyDeclaration: { freshlyPrepared: row.safetyFreshlyPrepared, properlyCovered: row.safetyProperlyCovered, noVisibleSpoilage: row.safetyNoSpoilage, storedAccordingToDeclaration: row.safetyStoredCorrectly, allergensDisclosed: row.safetyAllergensDisclosed, pickupDeadlineConfirmed: row.safetyDeadlineConfirmed, donorAccuracyConfirmed: row.safetyAccuracyConfirmed, declaredByUserId: row.donor.userId, declaredAt: row.safetyDeclaredAt },
    publishedAt: row.publishedAt, cancelledAt: row.cancelledAt, cancellationReason: row.cancellationReason ?? undefined, createdAt: row.createdAt, updatedAt: row.updatedAt,
  };
  return { ...createDonationView(JSON.parse(JSON.stringify(value)) as Donation, viewerFor(user), row.claims.map(claimDto), [{ ...addressDto(row.pickupAddress), coordinates: coordinates(row.pickupLatitude, row.pickupLongitude) }]),
    donorOrganization: row.donor.organizationName || row.donor.user.displayName, donorVerified: row.donor.verificationStatus === "VERIFIED" };
}

export function enumField<T extends string>(value: unknown, values: T[], field: string): T {
  if (typeof value !== "string" || !values.includes(value as T)) throw new ApiError(422, `Invalid ${field}.`);
  return value as T;
}

export function positiveNumber(value: unknown, field: string, integer = false) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || value > 1_000_000 || (integer && !Number.isInteger(value))) throw new ApiError(422, `Enter a positive ${field}.`);
  return value;
}

export async function expireOpenDonations() {
  await prisma.donation.updateMany({ where: { status: { in: ["AVAILABLE", "PUBLISHED"] }, safePickupDeadline: { lte: new Date() } }, data: { status: "EXPIRED" } });
}

export function visibleDonations(user: AuthAccount): Prisma.DonationWhereInput {
  if (user.role === "ADMIN") return {};
  if (user.role === "DONOR") return { donorProfileId: user.donorProfileId ?? "__none__" };
  if (user.role === "NGO") return { OR: [{ status: { in: ["AVAILABLE", "PUBLISHED"] }, safePickupDeadline: { gt: new Date() } }, { claims: { some: { ngoProfileId: user.ngoProfileId ?? "__none__" } } }] };
  return { claims: { some: { volunteerProfileId: user.volunteerProfileId ?? "__none__" } } };
}

export async function findVisibleDonation(id: string, user: AuthAccount) {
  const row = await prisma.donation.findFirst({ where: { AND: [{ id }, visibleDonations(user)] }, include: donationInclude });
  if (!row) throw new ApiError(404, "Donation not found for your account.");
  return row;
}

export async function publishDonation(body: Record<string, unknown>, user: AuthAccount) {
  if (!user.donorProfileId) throw new ApiError(403, "A donor profile is required.");
  const sampleImageId = textField(body.sampleImageId, "sampleImageId", 80, true) || null;
  if (sampleImageId && !sampleDonationImage(sampleImageId)) throw new ApiError(422, "Choose an available sample image.");
  if (sampleImageId && Array.isArray(body.photoUrls) && body.photoUrls.length) throw new ApiError(422, "Choose either an uploaded food photo or a sample image.");
  const quantity = object(body.quantity), pickup = object(body.pickup), contact = object(pickup.contact), safety = object(body.safetyDeclaration);
  const status = enumField(body.status ?? "AVAILABLE", ["AVAILABLE", "DRAFT"], "status");
  const declarationKeys = ["freshlyPrepared", "properlyCovered", "noVisibleSpoilage", "storedAccordingToDeclaration", "allergensDisclosed", "pickupDeadlineConfirmed", "donorAccuracyConfirmed"];
  if (status === "AVAILABLE" && declarationKeys.some((key) => safety[key] !== true)) throw new ApiError(422, "Confirm every food safety declaration.");
  const preparationTime = textField(body.preparationTime, "preparationTime", 100);
  const safePickupDeadline = textField(body.safePickupDeadline, "safePickupDeadline", 100);
  const windowStart = textField(pickup.windowStart, "pickupWindowStart", 100);
  const windowEnd = textField(pickup.windowEnd, "pickupWindowEnd", 100);
  const fieldErrors = validateDonationTimes({ preparationTime, safePickupDeadline, pickupWindowStart: windowStart, pickupWindowEnd: windowEnd, requireFutureDeadline: status !== "DRAFT" });
  if (Object.keys(fieldErrors).length) throw new ApiError(422, "Check the food and pickup times.", fieldErrors as Record<string, string>);
  const addressId = textField(pickup.addressId, "addressId", 160);
  const pickupAddress = await prisma.address.findFirst({ where: { id: addressId, ownerId: user.id } });
  if (!pickupAddress) throw new ApiError(403, "Select your own saved pickup address.");
  const phone = textField(contact.phone, "phone", 30);
  if (validateBangladeshPhone(phone)) throw new ApiError(422, "Enter a valid contact phone.");
  const dietaryTypes = Array.isArray(body.dietaryTypes) ? body.dietaryTypes.map((v) => enumField(v, Object.values(DietaryType), "dietary type")) : [];
  if (!dietaryTypes.length) throw new ApiError(422, "Choose a dietary type.");
  const allergens = Array.isArray(body.allergens) ? body.allergens.map((v) => textField(v, "allergens", 100)).slice(0, 30) : [];
  const preferredNgoProfileId = textField(body.preferredNgoProfileId, "preferredNgoProfileId", 160, true) || null;
  if (preferredNgoProfileId && !await prisma.nGOProfile.findFirst({ where: { id: preferredNgoProfileId, verificationStatus: "VERIFIED" } })) throw new ApiError(422, "Select an available verified NGO.");
  return prisma.$transaction(async (tx) => {
    const donation = await tx.donation.create({ data: {
      donorProfileId: user.donorProfileId!, pickupAddressId: addressId, preferredNgoProfileId,
      pickupLatitude: pickupAddress.latitude, pickupLongitude: pickupAddress.longitude,
      title: textField(body.title, "title", 160), description: textField(body.description, "description", 2000, true),
      category: enumField(body.category, Object.values(FoodCategory), "category"), dietaryTypes,
      quantityValue: positiveNumber(quantity.value, "quantity"), quantityUnit: enumField(quantity.unit, Object.values(QuantityUnit), "quantity unit"), estimatedMeals: positiveNumber(quantity.estimatedMeals, "estimated meals", true),
      preparationTime: new Date(preparationTime), safePickupDeadline: new Date(safePickupDeadline), windowStart: new Date(windowStart), windowEnd: new Date(windowEnd),
      storageCondition: enumField(body.storageCondition, Object.values(StorageCondition), "storage condition"), foodCondition: enumField(body.foodCondition, Object.values(FoodCondition), "food condition"),
      priority: enumField(body.priority, Object.values(PriorityLevel), "priority"), status, approximateArea: textField(pickup.approximateArea, "approximateArea", 200),
      contactName: textField(contact.name, "contactPerson", 120), contactPhone: phone, contactEmail: user.email,
      allergens, photoUrls: [], sampleImageId, specialInstructions: textField(body.specialInstructions, "specialInstructions", 1000, true), directions: textField(pickup.directions, "directions", 1000, true),
      safetyFreshlyPrepared: safety.freshlyPrepared === true, safetyProperlyCovered: safety.properlyCovered === true, safetyNoSpoilage: safety.noVisibleSpoilage === true,
      safetyStoredCorrectly: safety.storedAccordingToDeclaration === true, safetyAllergensDisclosed: safety.allergensDisclosed === true, safetyDeadlineConfirmed: safety.pickupDeadlineConfirmed === true,
      safetyAccuracyConfirmed: safety.donorAccuracyConfirmed === true, publishedAt: status === "AVAILABLE" ? new Date() : null,
    }, include: donationInclude });
    const photos = await attachPhotos(tx, body.photoUrls, user, "DONATION", { donationId: donation.id });
    if (photos.urls.length) {
      await tx.donation.update({ where: { id: donation.id }, data: { photoUrls: photos.urls } });
      donation.photoUrls = photos.urls;
    }
    await tx.donorProfile.update({ where: { id: user.donorProfileId }, data: { totalDonations: { increment: 1 } } });
    await tx.notification.create({ data: { userId: user.id, type: "SYSTEM", title: "Donation saved", message: donation.title, href: `/donor/donations/${donation.id}` } });
    return donation;
  });
}

export { claimVisibility } from "@/lib/db/rescue-access";

export async function reserveDonation(donationId: string, user: AuthAccount, foodRequestId?: string, allergenReviewAcknowledged?: boolean) {
  if (!user.ngoProfileId) throw new ApiError(403, "An NGO profile is required.");
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM donations WHERE id = ${donationId} FOR UPDATE`;
    const donation = await tx.donation.findUnique({ where: { id: donationId }, include: { pickupAddress: true } });
    if (!donation) throw new ApiError(404, "Donation not found.");
    if (donation.status !== "AVAILABLE" || donation.safePickupDeadline.getTime() <= Date.now()) throw new ApiError(409, "This food is already claimed, expired or unavailable.");
    const ngo = await tx.nGOProfile.findUniqueOrThrow({ where: { id: user.ngoProfileId } });
    if (ngo.verificationStatus !== "VERIFIED") throw new ApiError(403, "NGO verification is pending. Contact the project administrator.");
    if (!ngo.acceptedFoodCategories.includes(donation.category)) throw new ApiError(422, "This category is not accepted by your NGO.");
    let requestMealsAllocated = 0;
    const primaryAddress = await tx.address.findFirst({ where: { ownerId: user.id }, orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] });
    let deliveryAddress = primaryAddress ? addressDto(primaryAddress) : undefined;
    if (foodRequestId) {
      const request = await refreshRequestProgress(tx, foodRequestId);
      if (!request || request.ngoProfileId !== ngo.id) throw new ApiError(404, "Food request not found for your NGO.");
      if (!["FINDING_MATCH", "MATCHED"].includes(request.status) || request.neededBy.getTime() <= Date.now() || !request.remainingMeals) throw new ApiError(409, "This request is closed, expired or already fully reserved.");
      const match = requestMatch(request, donation);
      if (!match.eligible) throw new ApiError(422, "This donation does not meet the request's declared category, dietary, allergen, location or timing requirements.");
      if (match.allergenReviewRequired && allergenReviewAcknowledged !== true) throw new ApiError(422, "Confirm that you reviewed the donor's allergen declaration and request restrictions.");
      requestMealsAllocated = Math.min(request.remainingMeals, donation.estimatedMeals);
      deliveryAddress = requestAddress(request);
    }
    const claim = await tx.claim.create({ data: { donationId, ngoProfileId: ngo.id, matchScore: 0, foodRequestId, requestMealsAllocated, deliveryAddressSnapshot: deliveryAddress ? JSON.parse(JSON.stringify(deliveryAddress)) as Prisma.InputJsonObject : undefined } });
    await tx.donation.update({ where: { id: donationId }, data: { status: "RESERVED" } });
    const donor = await tx.donorProfile.findUniqueOrThrow({ where: { id: donation.donorProfileId } });
    await tx.notification.createMany({ data: [
      { userId: donor.userId, type: "CLAIM", title: "Donation claimed", message: `${ngo.organizationName} claimed ${donation.title}.`, href: `/donor/donations/${donationId}` },
      { userId: user.id, type: "CLAIM", title: "Claim confirmed", message: donation.title, href: `/ngo/claims/${claim.id}` },
    ] });
    if (foodRequestId) await refreshRequestProgress(tx, foodRequestId);
    return claim.id;
  });
}
