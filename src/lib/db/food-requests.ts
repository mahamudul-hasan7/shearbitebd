import { coordinates } from "@/lib/locations";
import { createHash } from "node:crypto";
import { Prisma, FoodCategory, DietaryType, PriorityLevel, RequestType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError, object, textField } from "@/lib/api";
import type { AuthAccount } from "@/lib/db/accounts";
import { enumField, positiveNumber, donationDto, donationInclude } from "@/lib/db/rescue";
import { requestProgress, refreshRequestProgress, ACTIVE_REQUEST_CLAIMS } from "@/lib/db/request-progress";
import { requestMatch } from "@/lib/db/request-matching";

export const requestInclude = { claims: { orderBy: { createdAt: "desc" as const }, select: { id: true, donationId: true, status: true, requestMealsAllocated: true, donation: { select: { title: true } }, distributionRecord: { select: { mealsDistributed: true } } } } } satisfies Prisma.FoodRequestInclude;
type RequestRow = Prisma.FoodRequestGetPayload<{ include: typeof requestInclude }>;
export function foodRequestDto(row: RequestRow) {
  return { id: row.id, ngoProfileId: row.ngoProfileId, title: row.title, requestType: row.requestType, priority: row.priority, priorityReason: row.priorityReason,
    supportingDocumentNames: [], purpose: row.purpose, recipientType: row.recipientType, categories: row.categories, dietaryTypes: row.dietaryTypes, specificPreferences: row.specificPreferences,
    allergensOrRestrictions: row.allergensOrRestrictions, peopleToServe: row.peopleToServe, mealsNeeded: row.mealsNeeded, neededWhen: row.neededWhen, neededBy: row.neededBy,
    preferredTimeSlot: row.preferredTimeSlot, deliveryAddressId: row.deliveryAddressId, locationType: row.locationType,
    deliveryLocation: { coordinates: coordinates(row.deliveryLatitude, row.deliveryLongitude), addressLine: row.deliveryAddressLine, area: row.deliveryArea, city: row.deliveryCity, landmark: row.deliveryLandmark, instructions: row.deliveryInstructions },
    notes: row.notes, status: row.status, createdAt: row.createdAt, updatedAt: row.updatedAt, ...requestProgress(row),
    linkedClaims: row.claims.map((claim) => ({ id: claim.id, donationId: claim.donationId, title: claim.donation.title, status: claim.status, mealsAllocated: claim.requestMealsAllocated, mealsDistributed: claim.distributionRecord?.mealsDistributed || 0 })) };
}
export async function ownFoodRequest(id: string, user: AuthAccount) {
  const row = await prisma.foodRequest.findFirst({ where: { id, ngoProfileId: user.ngoProfileId || "__none__" }, include: requestInclude });
  if (!row) throw new ApiError(404, "Food request not found for your NGO.");
  return row;
}
export async function expireFoodRequests(user: AuthAccount) {
  await prisma.foodRequest.updateMany({ where: { ngoProfileId: user.ngoProfileId || "__none__", status: { in: ["FINDING_MATCH", "PENDING_REVIEW", "DRAFT"] }, neededBy: { lte: new Date() } }, data: { status: "EXPIRED" } });
}
function textList(value: unknown, field: string) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 20) throw new ApiError(422, `Choose up to twenty ${field}.`);
  return [...new Set(value.map((v) => textField(v, field, 100)))];
}
function enumList<T extends string>(value: unknown, values: T[], field: string) {
  if (!Array.isArray(value) || !value.length || value.length > values.length) throw new ApiError(422, `Choose valid ${field}.`, { [field]: "Select at least one option." });
  return [...new Set(value.map((v) => enumField(v, values, field)))];
}
async function parseRequest(input: Record<string, unknown>, user: AuthAccount) {
  const priority = enumField(input.priority, Object.values(PriorityLevel), "priority");
  const priorityReason = textField(input.priorityReason, "priorityReason", 1000, true);
  if (["HIGH", "URGENT"].includes(priority) && priorityReason.length < 12) throw new ApiError(422, "Explain the high-priority need in at least twelve characters.", { priorityReason: "Explain the urgency clearly." });
  const peopleToServe = positiveNumber(input.peopleToServe, "peopleToServe", true), mealsNeeded = positiveNumber(input.mealsNeeded, "mealsNeeded", true);
  if (peopleToServe > mealsNeeded) throw new ApiError(422, "Record at least one requested meal per person.", { mealsNeeded: "Meals cannot be fewer than people to serve." });
  const neededBy = new Date(textField(input.neededBy, "neededBy", 100));
  if (!Number.isFinite(neededBy.getTime()) || neededBy.getTime() <= Date.now() || neededBy.getTime() > Date.now() + 90 * 86_400_000) throw new ApiError(422, "Choose a future deadline within 90 days.", { neededBy: "Choose a valid future requested time." });
  if (input.supportingDocumentNames !== undefined && (!Array.isArray(input.supportingDocumentNames) || input.supportingDocumentNames.length)) throw new ApiError(422, "Supporting document uploads are not part of this request form.");
  const deliveryAddressId = textField(input.deliveryAddressId, "deliveryAddressId", 160);
  const address = await prisma.address.findFirst({ where: { id: deliveryAddressId, ownerId: user.id } });
  if (!address) throw new ApiError(403, "Select a saved delivery address owned by your NGO.");
  if (!address.addressLine.trim() || !address.area.trim() || !address.city.trim()) throw new ApiError(422, "Complete the saved delivery address before publishing.");
  const location = input.deliveryLocation === undefined ? {} : object(input.deliveryLocation);
  return { title: textField(input.title, "title", 160), requestType: enumField(input.requestType, Object.values(RequestType), "request type"), priority, priorityReason,
    purpose: textField(input.purpose, "purpose", 2000), recipientType: textField(input.recipientType, "recipientType", 200),
    categories: enumList(input.categories, Object.values(FoodCategory), "categories"), dietaryTypes: enumList(input.dietaryTypes, Object.values(DietaryType), "dietaryTypes"),
    specificPreferences: textField(input.specificPreferences, "specificPreferences", 1000, true), allergensOrRestrictions: textList(input.allergensOrRestrictions, "allergensOrRestrictions"),
    peopleToServe, mealsNeeded, neededWhen: enumField(input.neededWhen, ["ASAP", "TODAY", "TOMORROW", "CUSTOM"], "requested timing"), neededBy,
    preferredTimeSlot: textField(input.preferredTimeSlot, "preferredTimeSlot", 200, true), deliveryAddressId,
    locationType: enumField(input.locationType, ["SHELTER", "COMMUNITY_CENTER", "OTHER"], "location type"),
    deliveryLatitude: address.latitude, deliveryLongitude: address.longitude,
    deliveryAddressLine: address.addressLine, deliveryArea: address.area, deliveryCity: address.city,
    deliveryLandmark: address.landmark || "", deliveryInstructions: textField(location.instructions, "deliveryInstructions", 1000, true), notes: textField(input.notes, "notes", 2000, true), supportingDocumentNames: [] as string[] };
}
export async function createFoodRequest(input: Record<string, unknown>, user: AuthAccount) {
  if (!user.ngoProfileId) throw new ApiError(403, "An NGO profile is required.");
  if (input.status !== undefined && input.status !== "FINDING_MATCH") throw new ApiError(422, "Request status is controlled by the matching and distribution workflow.");
  const submissionKey = textField(input.submissionKey, "submissionKey", 100);
  if (!/^[a-zA-Z0-9_-]{16,100}$/.test(submissionKey)) throw new ApiError(422, "Use a valid request submission key.");
  const payload = { ...input };
  delete payload.ngoProfileId; delete payload.status; delete payload.submissionKey;
  const canonical = (value: unknown): unknown => Array.isArray(value) ? value.map(canonical) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)])) : value;
  const hash = createHash("sha256").update(JSON.stringify(canonical(payload))).digest("hex");
  const previous = await prisma.foodRequest.findUnique({ where: { ngoProfileId_submissionKey: { ngoProfileId: user.ngoProfileId, submissionKey } }, include: requestInclude });
  if (previous) {
    if (previous.submissionHash !== hash) throw new ApiError(409, "This submission key was used for different request details.");
    return { request: foodRequestDto(previous), created: false };
  }
  const data = await parseRequest(input, user);
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM ngo_profiles WHERE id = ${user.ngoProfileId} FOR UPDATE`;
    const ngo = await tx.nGOProfile.findUniqueOrThrow({ where: { id: user.ngoProfileId } });
    if (ngo.verificationStatus !== "VERIFIED") throw new ApiError(403, "NGO verification is pending. A verified NGO is required to publish requests.");
    const old = await tx.foodRequest.findUnique({ where: { ngoProfileId_submissionKey: { ngoProfileId: ngo.id, submissionKey } }, include: requestInclude });
    if (old) {
      if (old.submissionHash !== hash) throw new ApiError(409, "This submission key was used for different request details.");
      return { request: foodRequestDto(old), created: false };
    }
    const row = await tx.foodRequest.create({ data: { ...data, ngoProfileId: ngo.id, status: "FINDING_MATCH", submissionKey, submissionHash: hash }, include: requestInclude });
    await tx.notification.create({ data: { userId: user.id, type: "SYSTEM", title: "Food request published", message: row.title, href: `/ngo/requests/${row.id}` } });
    return { request: foodRequestDto(row), created: true };
  });
}
export async function changeFoodRequest(id: string, action: unknown, input: Record<string, unknown>, user: AuthAccount) {
  await ownFoodRequest(id, user);
  return prisma.$transaction(async (tx) => {
    const progress = await refreshRequestProgress(tx, id);
    if (!progress || progress.ngoProfileId !== user.ngoProfileId) throw new ApiError(404, "Request not found.");
    const active = progress.claims.some((claim) => (ACTIVE_REQUEST_CLAIMS as readonly string[]).includes(claim.status));
    if (["FULFILLED", "CANCELLED", "EXPIRED"].includes(progress.status)) throw new ApiError(409, "This request is closed and cannot be changed.");
    if (active) throw new ApiError(409, "Finish or release the linked rescues before changing or cancelling this request.");
    if (action === "cancel") {
      await tx.foodRequest.update({ where: { id }, data: { status: "CANCELLED" } });
      await tx.notification.create({ data: { userId: user.id, type: "SYSTEM", title: "Food request cancelled", message: progress.title, href: `/ngo/requests/${id}` } });
    } else if (action === "update") {
      if (["status", "ngoProfileId", "id", "mealsFulfilled", "linkedClaims", "submissionKey"].some((key) => key in input)) throw new ApiError(422, "Identity, status and fulfillment are controlled by the server.");
      const ngo = await tx.nGOProfile.findUniqueOrThrow({ where: { id: user.ngoProfileId } });
      if (ngo.verificationStatus !== "VERIFIED") throw new ApiError(403, "NGO verification is required to update a published request.");
      if (progress.mealsFulfilled) throw new ApiError(409, "Requests with recorded distribution retain their original requirements.");
      if (await tx.claim.findFirst({ where: { foodRequestId: id, OR: [{ pickedUpAt: { not: null } }, { deliveredAt: { not: null } }] }, select: { id: true } })) throw new ApiError(409, "Requests with recorded pickup or delivery retain their original requirements and destination.");
      const existing = await tx.foodRequest.findUniqueOrThrow({ where: { id }, include: requestInclude });
      const merged = { ...foodRequestDto(existing), neededBy: existing.neededBy.toISOString(), ...input };
      const data = await parseRequest(merged, user);
      await tx.foodRequest.update({ where: { id }, data });
    } else throw new ApiError(422, "Use update or cancel.");
    return foodRequestDto(await tx.foodRequest.findUniqueOrThrow({ where: { id }, include: requestInclude }));
  });
}
export async function foodRequestMatches(id: string, user: AuthAccount) {
  const row = await ownFoodRequest(id, user);
  const progress = requestProgress(row);
  if (!["FINDING_MATCH", "MATCHED"].includes(row.status) || row.neededBy.getTime() <= Date.now() || !progress.remainingMeals) return { request: foodRequestDto(row), matches: [] };
  const ngo = await prisma.nGOProfile.findUniqueOrThrow({ where: { id: user.ngoProfileId } });
  if (ngo.verificationStatus !== "VERIFIED") throw new ApiError(403, "NGO verification is required to reserve food.");
  const donations = await prisma.donation.findMany({ where: { status: "AVAILABLE", category: { in: row.categories.filter((category) => ngo.acceptedFoodCategories.includes(category)) }, safePickupDeadline: { gt: new Date() }, windowEnd: { gt: new Date() }, windowStart: { lt: row.neededBy } }, include: donationInclude, orderBy: { safePickupDeadline: "asc" }, take: 200 });
  const matches = donations.map((donation) => ({ row: donation, ...requestMatch(row, donation) })).filter((item) => item.eligible)
    .sort((a, b) => b.score - a.score || a.row.safePickupDeadline.getTime() - b.row.safePickupDeadline.getTime()).map((item) => ({ donation: donationDto(item.row, user), score: item.score,
      reasons: item.reasons, allergenReviewRequired: item.allergenReviewRequired, mealsToAllocate: Math.min(progress.remainingMeals, item.row.estimatedMeals) }));
  return { request: foodRequestDto(row), matches };
}
