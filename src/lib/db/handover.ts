import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { Prisma, VerificationKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import type { AuthAccount } from "@/lib/db/accounts";
import { claimVisibility } from "@/lib/db/rescue";

export const OTP_DIGITS = 6;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_LIFETIME_MS = 10 * 60_000;
export const OTP_REISSUE_DELAY_MS = 60_000;

const workflowInclude = { donation: { include: { donor: true } }, ngo: true, volunteer: true, deliveryReceipt: true, distributionRecord: true, foodRequest: true } satisfies Prisma.ClaimInclude;
export type WorkflowClaim = Prisma.ClaimGetPayload<{ include: typeof workflowInclude }>;

export async function relatedClaim(id: string, user: AuthAccount) {
  const claim = await prisma.claim.findFirst({ where: { AND: [{ id }, claimVisibility(user)] }, include: workflowInclude });
  if (!claim) throw new ApiError(404, "Claim not found for your account.");
  return claim;
}

// Every handover/receipt/distribution operation locks the donation first, matching
// reservation, release and cancellation. This also serializes OTP attempts.
export async function withClaimLock<T>(id: string, user: AuthAccount, operation: (tx: Prisma.TransactionClient, claim: WorkflowClaim) => Promise<T>): Promise<T> {
  const previous = await relatedClaim(id, user);
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM donations WHERE id = ${previous.donationId} FOR UPDATE`;
    const claim = await tx.claim.findFirst({ where: { AND: [{ id }, claimVisibility(user)] }, include: workflowInclude });
    if (!claim) throw new ApiError(404, "Claim not found for your account.");
    return operation(tx, claim);
  });
}

function digest(claimId: string, kind: VerificationKind, code: string) {
  const secret = process.env.OTP_SECRET;
  if (!secret || secret.length < 32) throw new ApiError(503, "Handover verification is not configured. Contact the project operator.");
  return createHmac("sha256", secret).update(`${claimId}|${kind}|${code}`).digest("hex");
}

function assertHandoverStage(claim: WorkflowClaim, kind: VerificationKind) {
  const expected = kind === "PICKUP" ? "ASSIGNED" : "PICKED_UP";
  if (claim.status !== expected || claim.donation.status !== expected || !claim.volunteerProfileId) throw new ApiError(409, `This claim is not ready for ${kind.toLowerCase()} verification.`);
  if (claim.donation.safePickupDeadline.getTime() <= Date.now() || (kind === "PICKUP" && claim.donation.windowEnd.getTime() <= Date.now())) throw new ApiError(409, "The donor-declared safe handover window has expired.");
}

function canIssue(claim: WorkflowClaim, kind: VerificationKind, user: AuthAccount) {
  return kind === "PICKUP" ? user.role === "DONOR" && claim.donation.donor.userId === user.id : user.role === "NGO" && claim.ngo.userId === user.id;
}

export async function handoverState(id: string, user: AuthAccount) {
  const claim = await relatedClaim(id, user);
  const challenges = await prisma.handoverChallenge.findMany({ where: { claimId: id } });
  return { claimId: id, status: claim.status, challenges: Object.values(VerificationKind).map((kind) => {
    const challenge = challenges.find((c) => c.kind === kind);
    const ready = claim.status === (kind === "PICKUP" ? "ASSIGNED" : "PICKED_UP") && claim.donation.status === claim.status && Boolean(claim.volunteerProfileId) && claim.donation.safePickupDeadline.getTime() > Date.now() && (kind !== "PICKUP" || claim.donation.windowEnd.getTime() > Date.now());
    return { kind, canIssue: canIssue(claim, kind, user) && ready,
      issuedAt: challenge?.issuedAt, expiresAt: challenge?.expiresAt, consumedAt: challenge?.consumedAt,
      attemptsRemaining: Math.max(0, OTP_MAX_ATTEMPTS - (challenge?.attempts || 0)),
      reissueAfter: challenge ? new Date(challenge.issuedAt.getTime() + OTP_REISSUE_DELAY_MS) : null };
  }) };
}

export async function issueHandover(id: string, kind: VerificationKind, user: AuthAccount) {
  return withClaimLock(id, user, async (tx, claim) => {
    if (!canIssue(claim, kind, user)) throw new ApiError(403, "Only the donor can issue a pickup code; only the receiving NGO can issue a delivery code.");
    assertHandoverStage(claim, kind);
    const previous = await tx.handoverChallenge.findUnique({ where: { claimId_kind: { claimId: id, kind } } });
    const now = new Date();
    if (previous?.consumedAt) throw new ApiError(409, "This handover has already been verified.");
    if (previous && now.getTime() - previous.issuedAt.getTime() < OTP_REISSUE_DELAY_MS) throw new ApiError(429, "Wait one minute before creating a replacement code.");
    let code: string;
    do { code = String(randomInt(100000, 1000000)); } while (previous?.codeHash === digest(id, kind, code));
    const expiresAt = new Date(Math.min(now.getTime() + OTP_LIFETIME_MS, claim.donation.safePickupDeadline.getTime(), kind === "PICKUP" ? claim.donation.windowEnd.getTime() : Infinity));
    const data = { codeHash: digest(id, kind, code), issuedByUserId: user.id, issuedAt: now, expiresAt, attempts: 0, consumedAt: null };
    await tx.handoverChallenge.upsert({ where: { claimId_kind: { claimId: id, kind } }, create: { ...data, claimId: id, kind }, update: data });
    // Returned once to the authorized issuer. General GETs never return a code or digest.
    return { claimId: id, kind, code, expiresAt, reissueAfter: new Date(now.getTime() + OTP_REISSUE_DELAY_MS) };
  });
}

export async function verifyHandover(id: string, kind: VerificationKind, code: string, user: AuthAccount) {
  if (!/^\d{6}$/.test(code)) throw new ApiError(422, "Enter the complete six-digit code.");
  const outcome = await withClaimLock(id, user, async (tx, claim) => {
    if (user.role !== "VOLUNTEER" || !user.volunteerProfileId || claim.volunteerProfileId !== user.volunteerProfileId || claim.volunteer?.verificationStatus !== "VERIFIED") throw new ApiError(403, "Only the assigned, verified volunteer can verify this handover.");
    assertHandoverStage(claim, kind);
    const challenge = await tx.handoverChallenge.findUnique({ where: { claimId_kind: { claimId: id, kind } } });
    if (!challenge) throw new ApiError(409, "Ask the handover owner to generate a code first.");
    if (challenge.consumedAt) throw new ApiError(409, "This code has already been used.");
    if (challenge.expiresAt.getTime() <= Date.now()) throw new ApiError(410, "This code has expired. Ask the owner for a replacement.");
    if (challenge.attempts >= OTP_MAX_ATTEMPTS) throw new ApiError(429, "Attempt limit reached. Ask the owner for a replacement code.");
    const actual = Buffer.from(digest(id, kind, code), "hex");
    const expected = Buffer.from(challenge.codeHash, "hex");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      const attempts = challenge.attempts + 1;
      await tx.handoverChallenge.update({ where: { id: challenge.id }, data: { attempts } });
      // Return the failure so the attempt increment commits; throwing here would roll it back.
      return { ok: false as const, error: new ApiError(attempts >= OTP_MAX_ATTEMPTS ? 429 : 422, attempts >= OTP_MAX_ATTEMPTS ? "Attempt limit reached. Ask for a replacement code." : `Incorrect code. ${OTP_MAX_ATTEMPTS - attempts} attempts remain.`) };
    }
    const now = new Date();
    const status = kind === "PICKUP" ? "PICKED_UP" : "DELIVERED";
    const routeStage = kind === "PICKUP" ? "cargo_loaded" : "completed";
    await tx.handoverChallenge.update({ where: { id: challenge.id }, data: { consumedAt: now } });
    await tx.claim.update({ where: { id }, data: { status, routeStage, ...(kind === "PICKUP" ? { pickedUpAt: now } : { deliveredAt: now }) } });
    await tx.donation.update({ where: { id: claim.donationId }, data: { status } });
    if (kind === "DELIVERY") await tx.volunteerProfile.update({ where: { id: claim.volunteerProfileId }, data: { completedRescues: { increment: 1 } } });
    await tx.notification.createMany({ data: [claim.donation.donor.userId, claim.ngo.userId, user.id].map((userId) => ({ userId,
      type: kind, title: kind === "PICKUP" ? "Pickup verified" : "Delivery verified", message: claim.donation.title,
      href: userId === claim.donation.donor.userId ? `/donor/donations/${claim.donationId}` : userId === claim.ngo.userId ? `/ngo/claims/${id}` : "/volunteer/history" })) });
    return { ok: true as const, claimId: id, status, routeStage, verifiedAt: now };
  });
  if (!outcome.ok) throw outcome.error;
  return outcome;
}
