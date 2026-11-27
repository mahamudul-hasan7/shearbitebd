import { createHash } from "node:crypto";
import { IncidentType, PriorityLevel, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError, textField } from "@/lib/api";
import type { AuthAccount } from "@/lib/db/accounts";
import { claimVisibility, REPORTABLE_CLAIM_STATUSES } from "@/lib/db/rescue-access";
import { enumField } from "@/lib/db/rescue";
import { relatedClaim, withClaimLock, type WorkflowClaim } from "@/lib/db/handover";
import { attachPhotos } from "@/lib/db/photos";
import { refreshRequestProgress } from "@/lib/db/request-progress";

export const incidentInclude = { reviews: { orderBy: { createdAt: "asc" as const } }, reportedByUser: { select: { displayName: true, role: true } } } satisfies Prisma.IncidentReportInclude;
type IncidentRow = Prisma.IncidentReportGetPayload<{ include: typeof incidentInclude }>;
export function incidentDto(row: IncidentRow) {
  const { id, claimId, reportedByUserId, type, severity, description, evidenceUrls, preferredContactMethod, status, createdAt, updatedAt, resolvedAt, blocksRescue, decision, reviews } = row;
  return { id, claimId, reportedByUserId, type, severity, description, evidenceUrls, preferredContactMethod, status, createdAt, updatedAt, resolvedAt, blocksRescue, decision, reporterName: row.reportedByUser.displayName, reporterRole: row.reportedByUser.role,
    reviews: reviews.map(({ id, actorLabel, status, decision, note, createdAt }) => ({ id, actorLabel, status, decision, note, createdAt })) };
}

export async function listIncidents(params: URLSearchParams, user: AuthAccount) {
  const id = params.get("id"), claimId = params.get("claimId"), donationId = params.get("donationId");
  if (claimId) await relatedClaim(claimId, user);
  if (donationId) {
    const visible = user.role === "DONOR" || user.role === "ADMIN"
      ? await prisma.donation.findFirst({ where: { id: donationId, ...(user.role === "DONOR" ? { donorProfileId: user.donorProfileId || "__none__" } : {}) }, select: { id: true } })
      : await prisma.claim.findFirst({ where: { AND: [{ donationId }, claimVisibility(user)] }, select: { id: true } });
    if (!visible) throw new ApiError(404, "Donation reports not found for your account.");
  }
  const rows = await prisma.incidentReport.findMany({ where: { claim: claimVisibility(user), ...(id ? { id } : {}), ...(claimId ? { claimId } : {}), ...(donationId ? { claim: { AND: [{ donationId }, claimVisibility(user)] } } : {}) }, include: incidentInclude, orderBy: { createdAt: "desc" }, take: 200 });
  if (id && !rows.length) throw new ApiError(404, "Report not found for your account.");
  return rows.map(incidentDto);
}

export function reportableClaim(status: string) {
  return (REPORTABLE_CLAIM_STATUSES as readonly string[]).includes(status);
}

function participantIds(claim: WorkflowClaim) {
  return [...new Set([claim.donation.donor.userId, claim.ngo.userId, ...(claim.volunteer ? [claim.volunteer.userId] : [])])];
}
function reportHref(claim: WorkflowClaim, userId: string) {
  return userId === claim.donation.donor.userId ? `/donor/donations/${claim.donationId}/report-issue?claimId=${claim.id}`
    : userId === claim.ngo.userId ? `/ngo/claims/${claim.id}/report-issue` : `/volunteer/missions/mission-${claim.id}/report-issue`;
}

export async function createIncident(claimId: string, input: Record<string, unknown>, user: AuthAccount) {
  if (!["DONOR", "NGO", "VOLUNTEER"].includes(user.role)) throw new ApiError(403, "Only rescue participants can submit reports.");
  const type = enumField(input.type, Object.values(IncidentType), "issue category");
  const severity = enumField(input.severity, Object.values(PriorityLevel), "severity");
  const description = textField(input.description, "description", 2000);
  if (description.length < 12) throw new ApiError(422, "Describe the issue in at least 12 characters.", { description: "Enter at least 12 characters." });
  const preferredContactMethod = enumField(input.preferredContactMethod, ["PHONE", "EMAIL", "IN_APP"], "contact preference");
  const submissionKey = textField(input.submissionKey, "submissionKey", 100);
  if (!/^[a-zA-Z0-9_-]{16,100}$/.test(submissionKey)) throw new ApiError(422, "Use a valid report submission key.");
  const hash = createHash("sha256").update(JSON.stringify({ claimId, type, severity, description, preferredContactMethod, evidenceUrls: input.evidenceUrls || [] })).digest("hex");
  return withClaimLock(claimId, user, async (tx, claim) => {
    const previous = await tx.incidentReport.findUnique({ where: { reportedByUserId_submissionKey: { reportedByUserId: user.id, submissionKey } }, include: incidentInclude });
    if (previous) {
      if (previous.submissionHash !== hash) throw new ApiError(409, "This submission key was already used for different report details.");
      return { incident: incidentDto(previous), created: false };
    }
    if (!reportableClaim(claim.status)) throw new ApiError(409, "This rescue is closed. New operational reports cannot be submitted.");
    if (await tx.incidentReport.findFirst({ where: { claimId, reportedByUserId: user.id, type, status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } })) throw new ApiError(409, "You already have an open report in this category for this claim.");
    const photos = await attachPhotos(tx, input.evidenceUrls, user, "INCIDENT", { claimId });
    const blocksRescue = claim.status !== "DISTRIBUTED";
    const report = await tx.incidentReport.create({ data: { claimId, reportedByUserId: user.id, type, severity, description,
      evidenceUrls: photos.urls, preferredContactMethod, status: "SUBMITTED", submissionKey, submissionHash: hash, blocksRescue }, include: incidentInclude });
    if (blocksRescue) {
      await tx.claim.update({ where: { id: claimId }, data: { status: "DISPUTED", ...(claim.status !== "DISPUTED" ? { incidentHoldStatus: claim.status } : {}) } });
      await tx.donation.update({ where: { id: claim.donationId }, data: { status: "DISPUTED" } });
      // An unresolved incident must never leave a usable code behind.
      await tx.handoverChallenge.updateMany({ where: { claimId, consumedAt: null }, data: { expiresAt: new Date() } });
    }
    const adminUsers = blocksRescue
      ? await tx.user.findMany({ where: { role: "ADMIN", isActive: true, deletedAt: null }, select: { id: true } })
      : [];
    const participants = participantIds(claim);
    const recipients = [...new Set([...participants, ...adminUsers.map((admin) => admin.id)])];
    await tx.notification.createMany({
      data: recipients.map((userId) => ({
        userId,
        type: "URGENT",
        priority: severity,
        title: "Rescue issue submitted",
        message: `${claim.donation.title}: ${type}. ${blocksRescue ? "Rescue paused for review." : "Post-distribution report recorded."}`,
        href: participants.includes(userId) ? reportHref(claim, userId) : "/admin/reports",
      })),
    });
    return { incident: incidentDto(report), created: true };
  });
}

export interface IncidentReviewActor { userId?: string; label: string; }
// Call only from the ADMIN API or the local operator CLI, never a participant API.
export async function reviewIncident(id: string, input: Record<string, unknown>, actor: IncidentReviewActor) {
  const action = enumField(input.action, ["UNDER_REVIEW", "RESUME", "REJECT_FOOD", "CLOSE"], "review action");
  const note = textField(input.note, "review note", 2000);
  if (note.length < 12) throw new ApiError(422, "Add a review note of at least 12 characters.");
  const original = await prisma.incidentReport.findUnique({ where: { id }, include: { claim: { select: { donationId: true } } } });
  if (!original) throw new ApiError(404, "Report not found.");
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM donations WHERE id = ${original.claim.donationId} FOR UPDATE`;
    const incident = await tx.incidentReport.findUniqueOrThrow({ where: { id } });
    const claim = await tx.claim.findUniqueOrThrow({ where: { id: incident.claimId }, include: { donation: { include: { donor: true } }, ngo: true, volunteer: true, deliveryReceipt: true, distributionRecord: true, foodRequest: true } });
    if (action === "CLOSE" ? incident.status !== "RESOLVED" : !["SUBMITTED", "UNDER_REVIEW"].includes(incident.status) || (action === "UNDER_REVIEW" && incident.status !== "SUBMITTED")) throw new ApiError(409, "Follow the report review sequence.");
    const decision = action === "RESUME" || action === "REJECT_FOOD" ? action : incident.decision;
    const status = action === "UNDER_REVIEW" ? "UNDER_REVIEW" : action === "CLOSE" ? "CLOSED" : "RESOLVED";
    if (action === "RESUME" && incident.blocksRescue) {
      if (claim.status !== "DISPUTED" || !claim.incidentHoldStatus) throw new ApiError(409, "This batch cannot be resumed from its current status.");
      if (claim.deliveryReceipt?.distributionBlocked) throw new ApiError(409, "The NGO receipt marks this food damaged or poor; it cannot be resumed for distribution.");
      if (claim.donation.safePickupDeadline.getTime() <= Date.now() || (["RESERVED", "ASSIGNED"].includes(claim.incidentHoldStatus) && claim.donation.windowEnd.getTime() <= Date.now())) throw new ApiError(409, "The donor-declared safe handover deadline has expired.");
    }
    await tx.incidentReport.update({ where: { id }, data: { status, decision, ...(status === "RESOLVED" ? { resolvedAt: new Date() } : {}) } });
    await tx.incidentReview.create({ data: { incidentId: id, actorUserId: actor.userId, actorLabel: actor.label, status, decision, note } });
    if (incident.blocksRescue && action === "REJECT_FOOD" && claim.status === "DISPUTED") {
      if (claim.incidentHoldStatus === "DELIVERED" && claim.volunteerProfileId && claim.volunteer) {
        await tx.volunteerProfile.update({
          where: { id: claim.volunteerProfileId },
          data: { completedRescues: Math.max(0, claim.volunteer.completedRescues - 1) },
        });
      }
      await tx.claim.update({ where: { id: claim.id }, data: { status: "CANCELLED", incidentHoldStatus: null } });
      await tx.donation.update({ where: { id: claim.donationId }, data: { status: "CANCELLED", cancelledAt: new Date(), cancellationReason: `Food rejected after incident ${id}: ${note}` } });
      const extraOpen = await tx.incidentReport.findMany({
        where: { claimId: claim.id, id: { not: id }, status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
        select: { id: true },
      });
      if (extraOpen.length) {
        const closedAt = new Date();
        await tx.incidentReport.updateMany({
          where: { id: { in: extraOpen.map((r) => r.id) } },
          data: { status: "RESOLVED", decision: "REJECT_FOOD", resolvedAt: closedAt },
        });
        await tx.incidentReview.createMany({
          data: extraOpen.map((r) => ({
            incidentId: r.id,
            actorUserId: actor.userId,
            actorLabel: actor.label,
            status: "RESOLVED",
            decision: "REJECT_FOOD",
            note: `Closed alongside incident ${id}: ${note}`,
          })),
        });
      }
      if (claim.foodRequestId) await refreshRequestProgress(tx, claim.foodRequestId);
    } else if (incident.blocksRescue && action === "RESUME" && claim.incidentHoldStatus) {
      const remaining = await tx.incidentReport.count({ where: { claimId: claim.id, blocksRescue: true, status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } });
      const rejected = await tx.incidentReport.count({ where: { claimId: claim.id, blocksRescue: true, decision: "REJECT_FOOD" } });
      if (!remaining && !rejected) {
        await tx.claim.update({ where: { id: claim.id }, data: { status: claim.incidentHoldStatus, incidentHoldStatus: null } });
        await tx.donation.update({ where: { id: claim.donationId }, data: { status: claim.incidentHoldStatus } });
      }
    }
    await tx.notification.createMany({ data: participantIds(claim).map((userId) => ({ userId, type: "SYSTEM", title: "Incident review updated", message: `${claim.donation.title}: ${status}${decision ? " / " + decision : ""}. ${note}`, href: reportHref(claim, userId) })) });
    return incidentDto(await tx.incidentReport.findUniqueOrThrow({ where: { id }, include: incidentInclude }));
  });
}
