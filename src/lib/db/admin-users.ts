import { randomUUID } from "node:crypto";
import { Prisma, type UserAccessAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError, textField } from "@/lib/api";
import type { AuthAccount } from "@/lib/db/accounts";

const roles = ["DONOR", "NGO", "VOLUNTEER"] as const;
const active = [
  "RESERVED",
  "ASSIGNED",
  "PICKED_UP",
  "DELIVERED",
  "DISPUTED",
] as const;
const openRequestStatuses = [
  "DRAFT",
  "PENDING_REVIEW",
  "FINDING_MATCH",
  "MATCHED",
] as const;
const select = {
  id: true,
  email: true,
  displayName: true,
  phone: true,
  role: true,
  isActive: true,
  deletedAt: true,
  accessVersion: true,
  createdAt: true,
  donorProfile: {
    select: { organizationName: true, verificationStatus: true },
  },
  ngoProfile: { select: { organizationName: true, verificationStatus: true } },
  volunteerProfile: { select: { verificationStatus: true } },
} satisfies Prisma.UserSelect;
function dto(row: Prisma.UserGetPayload<{ select: typeof select }>) {
  return {
    id: row.id,
    displayName: row.displayName,
    email: row.deletedAt ? null : row.email,
    phone: row.phone,
    role: row.role,
    version: row.accessVersion,
    access: row.deletedAt ? "DELETED" : row.isActive ? "ACTIVE" : "BANNED",
    verification:
      (row.donorProfile || row.ngoProfile || row.volunteerProfile)
        ?.verificationStatus || "NOT_SUBMITTED",
    organization:
      row.donorProfile?.organizationName ||
      row.ngoProfile?.organizationName ||
      "",
    createdAt: row.createdAt.toISOString(),
    deletedAt: row.deletedAt?.toISOString() || null,
  };
}
export async function adminUsers(params: URLSearchParams) {
  const q = (params.get("q") || "").trim(),
    role = params.get("role") || "ALL";
  const access = params.get("access") || "ALL",
    page = params.get("page") || "1",
    pageSize = 20;
  if (
    q.length > 120 ||
    !["ALL", ...roles].includes(role) ||
    !["ALL", "ACTIVE", "BANNED", "DELETED"].includes(access) ||
    !/^[1-9]\d{0,5}$/.test(page)
  )
    throw new ApiError(422, "Check the search filters.");
  const where: Prisma.UserWhereInput = {
    role: {
      in: role === "ALL" ? [...roles] : [role as (typeof roles)[number]],
    },
    deletedAt: access === "DELETED" ? { not: null } : null,
    ...(access === "ACTIVE"
      ? { isActive: true }
      : access === "BANNED"
        ? { isActive: false }
        : {}),
    ...(q
      ? {
          OR: [
            { displayName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            {
              donorProfile: {
                organizationName: { contains: q, mode: "insensitive" },
              },
            },
            {
              ngoProfile: {
                organizationName: { contains: q, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
  };
  const [total, rows] = await prisma.$transaction(
    [
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: pageSize,
        skip: (Number(page) - 1) * pageSize,
      }),
    ],
    { isolationLevel: "RepeatableRead" },
  );
  return { items: rows.map(dto), total, page: Number(page), pageSize };
}
function rescueWhere(id: string): Prisma.ClaimWhereInput {
  return {
    status: { in: [...active] },
    OR: [
      { donation: { donor: { userId: id } } },
      { ngo: { userId: id } },
      { volunteer: { userId: id } },
    ],
  };
}
async function activity(tx: Prisma.TransactionClient, id: string) {
  const [activeRescues, openDonations, openRequests] = await Promise.all([
    tx.claim.count({ where: rescueWhere(id) }),
    tx.donation.count({
      where: {
        donor: { userId: id },
        status: { in: ["DRAFT", "AVAILABLE", "PUBLISHED"] },
      },
    }),
    tx.foodRequest.count({
      where: {
        ngo: { userId: id },
        status: { in: [...openRequestStatuses] },
      },
    }),
  ]);
  return { activeRescues, openDonations, openRequests };
}
export async function adminUser(id: string) {
  return prisma.$transaction(
    async (tx) => {
      const row = await tx.user.findFirst({
        where: { id, role: { in: [...roles] } },
        select,
      });
      if (!row) throw new ApiError(404, "Account not found.");
      const [work, history] = await Promise.all([
        activity(tx, id),
        tx.userAccessAudit.findMany({
          where: { targetUserId: id },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: 20,
          select: {
            id: true,
            actorLabel: true,
            action: true,
            note: true,
            createdAt: true,
          },
        }),
      ]);
      return {
        user: dto(row),
        activity: work,
        history: history.map((h) => ({
          ...h,
          createdAt: h.createdAt.toISOString(),
        })),
      };
    },
    { isolationLevel: "RepeatableRead" },
  );
}
export async function changeUserAccess(
  input: Record<string, unknown>,
  actor: AuthAccount,
) {
  if (actor.role !== "ADMIN") throw new ApiError(403, "Access denied.");
  const id = textField(input.id, "account id", 160),
    note = textField(input.note, "reason", 1000);
  const key = textField(input.submissionKey, "submission key", 100),
    action = input.action as UserAccessAction;
  const version = input.expectedVersion;
  if (
    !["BAN", "UNBAN", "DELETE"].includes(action) ||
    !Number.isSafeInteger(version) ||
    Number(version) < 0 ||
    !/^[a-zA-Z0-9_-]{16,100}$/.test(key)
  )
    throw new ApiError(422, "Check the account action details.");
  if (note.length < 12)
    throw new ApiError(422, "Add a reason of at least 12 characters.");
  if (action === "DELETE" && input.confirmation !== "DELETE")
    throw new ApiError(
      422,
      "Type DELETE to confirm permanent account removal.",
    );
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM users WHERE id = ${id} FOR NO KEY UPDATE`;
    const row = await tx.user.findUnique({ where: { id }, select });
    if (!row) throw new ApiError(404, "Account not found.");
    if (row.role === "ADMIN" || id === actor.id)
      throw new ApiError(403, "Admin accounts cannot be changed here.");
    const previous = await tx.userAccessAudit.findUnique({
      where: { submissionKey: key },
    });
    if (previous) {
      if (
        previous.targetUserId !== id ||
        previous.actorUserId !== actor.id ||
        previous.action !== action ||
        previous.note !== note ||
        previous.previousVersion !== version
      )
        throw new ApiError(
          409,
          "This submission key was already used for different account details.",
        );
      return { user: dto(row), repeated: true };
    }
    if (row.deletedAt)
      throw new ApiError(409, "This account was permanently deleted.");
    if (row.accessVersion !== version)
      throw new ApiError(
        409,
        "This account changed. Reload its details before continuing.",
      );
    if (action !== "DELETE" && row.isActive === (action === "UNBAN"))
      throw new ApiError(
        409,
        "This account already has the requested access status.",
      );
    if (action === "DELETE") {
      // Serialize with claims already in flight, then count again under the locks.
      await tx.$queryRaw`SELECT d.id FROM donations d JOIN donor_profiles p ON p.id = d."donorProfileId" WHERE p."userId" = ${id} ORDER BY d.id FOR UPDATE OF d`;
      await tx.$queryRaw`SELECT r.id FROM food_requests r JOIN ngo_profiles p ON p.id = r."ngoProfileId" WHERE p."userId" = ${id} ORDER BY r.id FOR UPDATE OF r`;
      if (await tx.claim.count({ where: rescueWhere(id) }))
        throw new ApiError(
          409,
          "Resolve active rescues before deleting this account.",
        );
      await tx.donation.updateMany({
        where: {
          donor: { userId: id },
          status: { in: ["DRAFT", "AVAILABLE", "PUBLISHED"] },
        },
        data: { status: "CANCELLED" },
      });
      await tx.foodRequest.updateMany({
        where: {
          ngo: { userId: id },
          status: { in: [...openRequestStatuses] },
        },
        data: { status: "CANCELLED" },
      });
    }
    // Revoked tokens never become valid again, including after an unban.
    await tx.authSession.deleteMany({ where: { userId: id } });
    const updated = await tx.user.update({
      where: { id },
      data: {
        isActive: action === "UNBAN",
        accessVersion: { increment: 1 },
        ...(action === "DELETE"
          ? {
              deletedAt: new Date(),
              password: null,
              username: null,
              normalizedPhone: null,
              email: `deleted-${randomUUID()}@accounts.invalid`,
            }
          : {}),
      },
      select,
    });
    if (action !== "UNBAN")
      await tx.volunteerProfile.updateMany({
        where: { userId: id },
        data: { isOnDuty: false },
      });
    await tx.userAccessAudit.create({
      data: {
        targetUserId: id,
        actorUserId: actor.id,
        actorLabel: actor.displayName,
        action,
        note,
        submissionKey: key,
        previousVersion: row.accessVersion,
        previousActive: row.isActive,
      },
    });
    return { user: dto(updated), repeated: false };
  });
}
export type ManagedUser = ReturnType<typeof dto>;
export type ManagedUserDetail = Awaited<ReturnType<typeof adminUser>>;
