import { prisma } from "@/lib/prisma";
import { ApiError, textField } from "@/lib/api";
import type { AuthAccount } from "@/lib/db/accounts";
import { enumField, positiveNumber } from "@/lib/db/rescue";
import { relatedClaim, withClaimLock } from "@/lib/db/handover";
import { attachPhotos } from "@/lib/db/photos";
import { refreshRequestProgress } from "@/lib/db/request-progress";

function fileNames(value: unknown) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 5) throw new ApiError(422, "Select up to five evidence file names.");
  return value.map((name) => textField(name, "photoNames", 200));
}

export async function getReceipt(id: string, user: AuthAccount) {
  await relatedClaim(id, user);
  return prisma.deliveryReceipt.findUnique({ where: { claimId: id } });
}

export async function saveReceipt(id: string, input: Record<string, unknown>, user: AuthAccount) {
  if (user.role !== "NGO" || !user.ngoProfileId) throw new ApiError(403, "Only the receiving NGO can record a receipt.");
  const actualQuantity = positiveNumber(input.actualQuantity, "actualQuantity");
  const foodCondition = enumField(input.foodCondition, ["GOOD", "ACCEPTABLE", "DAMAGED_POOR"], "food condition");
  const notes = textField(input.notes, "notes", 2000, true);
  if (foodCondition === "DAMAGED_POOR" && notes.length < 12) throw new ApiError(422, "Describe the damaged food condition in at least 12 characters.", { notes: "Describe the food safety concern." });
  const photoNames = fileNames(input.photoNames);
  return withClaimLock(id, user, async (tx, claim) => {
    if (claim.ngoProfileId !== user.ngoProfileId) throw new ApiError(404, "Claim not found for your NGO.");
    if (claim.status !== "DELIVERED" || claim.donation.status !== "DELIVERED") throw new ApiError(409, "The assigned volunteer must verify delivery before the NGO records its receipt.");
    if (claim.deliveryReceipt) throw new ApiError(409, "A receipt already exists for this delivery.");
    const proof = await tx.handoverChallenge.findUnique({ where: { claimId_kind: { claimId: id, kind: "DELIVERY" } } });
    if (!proof?.consumedAt) throw new ApiError(409, "A verified delivery handover is required.");
    const mismatch = actualQuantity !== claim.donation.quantityValue;
    if (mismatch && input.quantityMismatchConfirmed !== true) throw new ApiError(422, "Confirm the received quantity mismatch.", { quantityMismatchConfirmed: "Acknowledge the difference from the expected quantity." });
    const photos = await attachPhotos(tx, input.photoUrls, user, "RECEIPT", { claimId: id });
    const receipt = await tx.deliveryReceipt.create({ data: { claimId: id, ngoProfileId: claim.ngoProfileId,
      expectedQuantity: claim.donation.quantityValue, actualQuantity, quantityUnit: claim.donation.quantityUnit,
      foodCondition, quantityMismatchConfirmed: mismatch, distributionBlocked: foodCondition === "DAMAGED_POOR",
      verificationMethod: "OTP", notes: notes || null, photoNames: photos.urls.length ? photos.names : photoNames, photoUrls: photos.urls } });
    await tx.notification.create({ data: { userId: claim.donation.donor.userId, type: "DELIVERY", title: "NGO receipt recorded", message: `${claim.donation.title}: ${actualQuantity} ${claim.donation.quantityUnit}; ${foodCondition}.`, href: `/donor/donations/${claim.donationId}` } });
    return receipt;
  });
}

export async function getDistribution(id: string, user: AuthAccount) {
  await relatedClaim(id, user);
  return prisma.distributionRecord.findUnique({ where: { claimId: id } });
}

function optionalCount(value: unknown, field: string) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 1_000_000) throw new ApiError(422, `Enter a valid ${field}.`, { breakdown: "Use non-negative whole-number beneficiary counts." });
  return value;
}

export async function saveDistribution(id: string, input: Record<string, unknown>, user: AuthAccount) {
  if (user.role !== "NGO" || !user.ngoProfileId) throw new ApiError(403, "Only the receiving NGO can record distribution.");
  const beneficiariesServed = positiveNumber(input.beneficiariesServed, "beneficiariesServed", true);
  const mealsDistributed = positiveNumber(input.mealsDistributed, "mealsDistributed", true);
  const adultsServed = optionalCount(input.adultsServed, "adultsServed");
  const childrenServed = optionalCount(input.childrenServed, "childrenServed");
  if ((adultsServed || 0) + (childrenServed || 0) > beneficiariesServed) throw new ApiError(422, "The beneficiary breakdown exceeds the total.", { breakdown: "Adult and child counts cannot exceed total people served." });
  if (beneficiariesServed > mealsDistributed) throw new ApiError(422, "People served cannot exceed recorded meals in this workflow.", { beneficiariesServed: "Record at least one meal per beneficiary." });
  if (input.beneficiaryConsentConfirmed !== true) throw new ApiError(422, "Confirm the beneficiary privacy and consent declaration.", { beneficiaryConsentConfirmed: "Consent confirmation is required." });
  const distributedAt = new Date(textField(input.distributedAt, "distributedAt", 100));
  if (!Number.isFinite(distributedAt.getTime()) || distributedAt.getTime() > Date.now()) throw new ApiError(422, "Choose a valid distribution time, no later than now.", { distributedAt: "Distribution time cannot be in the future." });
  const addressId = textField(input.addressId, "addressId", 160);
  const notes = textField(input.notes, "notes", 2000, true);
  const photoNames = fileNames(input.photoNames);
  return withClaimLock(id, user, async (tx, claim) => {
    if (claim.ngoProfileId !== user.ngoProfileId) throw new ApiError(404, "Claim not found for your NGO.");
    if (claim.status !== "DELIVERED" || claim.donation.status !== "DELIVERED" || claim.distributionRecord) throw new ApiError(409, "Only an undistributed, delivered claim can be completed.");
    const receipt = claim.deliveryReceipt;
    if (!receipt) throw new ApiError(409, "Record the NGO delivery receipt first.");
    if (receipt.distributionBlocked) throw new ApiError(409, "Distribution is blocked because the received food was marked damaged or poor.");
    if (claim.donation.safePickupDeadline.getTime() <= Date.now()) throw new ApiError(409, "The donor-declared safe food deadline has expired. Do not distribute this batch.");
    if (distributedAt.getTime() < receipt.receivedAt.getTime()) throw new ApiError(422, "Distribution cannot precede the recorded receipt.", { distributedAt: "Choose a time on or after the NGO receipt." });
    if (!await tx.address.findFirst({ where: { id: addressId, ownerId: user.id } })) throw new ApiError(403, "Select a distribution address owned by your NGO.");
    if (claim.foodRequest && addressId !== claim.foodRequest.deliveryAddressId) throw new ApiError(422, "Record this request's distribution at its declared delivery address.");
    const receivedFraction = Math.min(1, receipt.actualQuantity / receipt.expectedQuantity);
    const mealCapacity = Math.floor(claim.donation.estimatedMeals * receivedFraction);
    if (mealsDistributed > mealCapacity) throw new ApiError(422, `The received food supports at most ${mealCapacity} declared meals.`, { mealsDistributed: "Distribution cannot exceed the received share of the donor's declared meals." });
    const photos = await attachPhotos(tx, input.photoUrls, user, "DISTRIBUTION", { claimId: id });
    const distribution = await tx.distributionRecord.create({ data: { claimId: id, ngoProfileId: claim.ngoProfileId,
      beneficiariesServed, mealsDistributed, adultsServed, childrenServed, distributedAt, addressId, notes: notes || null,
      photoNames: photos.urls.length ? photos.names : photoNames, photoUrls: photos.urls, beneficiaryConsentConfirmed: true } });
    // Weight and environmental values are explicitly estimates, not sensor readings
    // or official certification. Only distributed meals contribute to impact.
    const foodWeightKg = claim.donation.quantityUnit === "KILOGRAMS"
      ? Math.min(receipt.actualQuantity, receipt.expectedQuantity) * mealsDistributed / Math.max(1, mealCapacity)
      : mealsDistributed * 0.5;
    await tx.impactRecord.create({ data: { claimId: id, donorProfileId: claim.donation.donorProfileId, ngoProfileId: claim.ngoProfileId,
      recordedAt: distributedAt, mealsRescued: mealsDistributed, beneficiariesServed, foodWeightKg,
      estimatedCo2PreventedKg: foodWeightKg * 2.5, estimatedWaterSavedLitres: foodWeightKg * 250,
      estimateMethodology: "Project estimate: declared kilograms prorated to recorded distribution, or 0.5 kg/meal otherwise. Illustrative factors: 2.5 kg CO2e and 250 litres/kg. Not measured environmental results." } });
    await tx.claim.update({ where: { id }, data: { status: "DISTRIBUTED", distributedAt } });
    await tx.donation.update({ where: { id: claim.donationId }, data: { status: "DISTRIBUTED" } });
    if (claim.foodRequestId) await refreshRequestProgress(tx, claim.foodRequestId);
    await tx.nGOProfile.update({ where: { id: claim.ngoProfileId }, data: { completedRescues: { increment: 1 }, peopleHelped: { increment: beneficiariesServed } } });
    await tx.notification.createMany({ data: [claim.donation.donor.userId, claim.ngo.userId, ...(claim.volunteer ? [claim.volunteer.userId] : [])].map((userId) => ({ userId, type: "IMPACT", title: "Distribution recorded", message: `${mealsDistributed} meals served to ${beneficiariesServed} people.`, href: userId === claim.ngo.userId ? "/ngo/impact" : userId === claim.donation.donor.userId ? `/donor/donations/${claim.donationId}` : "/volunteer/history" })) });
    return distribution;
  });
}
