import { Prisma, type VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError, textField } from "@/lib/api";
import type { AuthAccount } from "@/lib/db/accounts";
import {
  verificationFileSelect,
  verificationFileDto,
} from "@/lib/db/verification-documents";
import { savedDeliveryAddress } from "@/lib/db/locations";

const roles = ["DONOR", "NGO", "VOLUNTEER"] as const;
const pending = ["PENDING", "NOT_SUBMITTED"] as const;
const active = [
  "RESERVED",
  "ASSIGNED",
  "PICKED_UP",
  "DELIVERED",
  "DISPUTED",
] as const;
const accountSelect = {
  id: true,
  email: true,
  displayName: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  donorProfile: {
    select: {
      organizationName: true,
      bfsaCertNumber: true,
      verificationStatus: true,
      updatedAt: true,
    },
  },
  ngoProfile: {
    select: {
      organizationName: true,
      registrationNumber: true,
      summary: true,
      verificationDocName: true,
      verificationDocument: { select: verificationFileSelect },
      verificationStatus: true,
      updatedAt: true,
    },
  },
  volunteerProfile: {
    select: {
      transportMethod: true,
      serviceAreas: true,
      identityDocumentName: true,
      verificationDocument: { select: verificationFileSelect },
      verificationStatus: true,
      updatedAt: true,
    },
  },
  addresses: {
    select: { addressLine: true, city: true },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    take: 1,
  },
} satisfies Prisma.UserSelect;
function accountDto(
  row: Prisma.UserGetPayload<{ select: typeof accountSelect }>,
) {
  const profile = row.donorProfile || row.ngoProfile || row.volunteerProfile;
  const document =
    row.ngoProfile?.verificationDocument ||
    row.volunteerProfile?.verificationDocument;
  return {
    document: document ? verificationFileDto(document) : null,
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    phone: row.phone,
    role: row.role,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    status: profile?.verificationStatus || "NOT_SUBMITTED",
    version: profile?.updatedAt.toISOString() || "",
    organization:
      row.donorProfile?.organizationName ||
      row.ngoProfile?.organizationName ||
      "",
    registrationNumber:
      row.ngoProfile?.registrationNumber ||
      row.donorProfile?.bfsaCertNumber ||
      "",
    documentName:
      document?.originalName ||
      row.ngoProfile?.verificationDocName ||
      row.volunteerProfile?.identityDocumentName ||
      "",
    summary: row.ngoProfile?.summary || "",
    serviceAreas: row.volunteerProfile?.serviceAreas || [],
    transport: row.volunteerProfile?.transportMethod || "",
    address: row.addresses[0]
      ? `${row.addresses[0].addressLine}, ${row.addresses[0].city}`
      : "",
  };
}
function statusWhere(status: string): Prisma.UserWhereInput {
  const values: VerificationStatus[] =
    status === "PENDING" ? [...pending] : [status as VerificationStatus];
  return {
    OR: [
      { donorProfile: { verificationStatus: { in: values } } },
      { ngoProfile: { verificationStatus: { in: values } } },
      { volunteerProfile: { verificationStatus: { in: values } } },
    ],
  };
}
const pendingWhere: Prisma.UserWhereInput = {
  role: { in: [...roles] },
  isActive: true,
  ...statusWhere("PENDING"),
};
const rescueSelect = {
  id: true,
  status: true,
  routeStage: true,
  createdAt: true,
  deliveryAddressSnapshot: true,
  donation: {
    select: {
      title: true,
      estimatedMeals: true,
      safePickupDeadline: true,
      contactName: true,
      contactPhone: true,
      pickupAddress: { select: { addressLine: true, city: true } },
      donor: {
        select: {
          organizationName: true,
          user: { select: { displayName: true } },
        },
      },
    },
  },
  ngo: { select: { organizationName: true, publicPhone: true } },
  volunteer: {
    select: { user: { select: { displayName: true, phone: true } } },
  },
} satisfies Prisma.ClaimSelect;
function rescueDto(
  row: Prisma.ClaimGetPayload<{ select: typeof rescueSelect }>,
) {
  const destination = savedDeliveryAddress(row.deliveryAddressSnapshot);
  return {
    id: row.id,
    status: row.status,
    routeStage: row.routeStage,
    createdAt: row.createdAt.toISOString(),
    title: row.donation.title,
    meals: row.donation.estimatedMeals,
    deadline: row.donation.safePickupDeadline.toISOString(),
    donor:
      row.donation.donor.organizationName ||
      row.donation.donor.user.displayName,
    pickupAddress: `${row.donation.pickupAddress.addressLine}, ${row.donation.pickupAddress.city}`,
    pickupContact: row.donation.contactName,
    pickupPhone: row.donation.contactPhone,
    ngo: row.ngo.organizationName,
    ngoPhone: row.ngo.publicPhone,
    deliveryAddress: destination?.addressLine || "",
    volunteer: row.volunteer?.user.displayName || "",
    volunteerPhone: row.volunteer?.user.phone || "",
  };
}
const reportSelect = {
  id: true,
  claimId: true,
  type: true,
  severity: true,
  status: true,
  description: true,
  evidenceUrls: true,
  blocksRescue: true,
  decision: true,
  createdAt: true,
  reportedByUser: { select: { displayName: true, role: true } },
  claim: { select: { donation: { select: { title: true } } } },
  reviews: {
    select: {
      id: true,
      actorLabel: true,
      note: true,
      status: true,
      decision: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  },
} satisfies Prisma.IncidentReportSelect;
function reportDto(
  row: Prisma.IncidentReportGetPayload<{ select: typeof reportSelect }>,
) {
  return {
    id: row.id,
    claimId: row.claimId,
    type: row.type,
    severity: row.severity,
    status: row.status,
    description: row.description,
    evidenceUrls: row.evidenceUrls,
    blocksRescue: row.blocksRescue,
    decision: row.decision,
    createdAt: row.createdAt.toISOString(),
    title: row.claim.donation.title,
    reporter: row.reportedByUser.displayName,
    reporterRole: row.reportedByUser.role,
    reviews: row.reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}
function filters(
  params: URLSearchParams,
  statuses: string[],
  defaultStatus: string,
) {
  const q = (params.get("q") || "").trim();
  const status = params.get("status") || defaultStatus;
  const page = params.get("page") || "1";
  if (
    q.length > 120 ||
    !statuses.includes(status) ||
    !/^[1-9]\d{0,5}$/.test(page)
  )
    throw new ApiError(422, "Check the search filters.");
  return { q, status, page: Number(page), pageSize: 20 };
}
export async function adminAccounts(params: URLSearchParams) {
  const { q, status, page, pageSize } = filters(
    params,
    ["ALL", "PENDING", "VERIFIED", "REJECTED"],
    "PENDING",
  );
  const role = params.get("role") || "ALL";
  if (role !== "ALL" && !(roles as readonly string[]).includes(role))
    throw new ApiError(422, "Check the search filters.");
  const where: Prisma.UserWhereInput = {
    role: {
      in: role === "ALL" ? [...roles] : [role as (typeof roles)[number]],
    },
    ...(status !== "ALL" ? { isActive: true, ...statusWhere(status) } : {}),
    ...(q
      ? {
          AND: [
            {
              OR: [
                { displayName: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                {
                  ngoProfile: {
                    organizationName: { contains: q, mode: "insensitive" },
                  },
                },
                {
                  donorProfile: {
                    organizationName: { contains: q, mode: "insensitive" },
                  },
                },
              ],
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
        select: accountSelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ],
    { isolationLevel: "RepeatableRead" },
  );
  return { items: rows.map(accountDto), total, page, pageSize };
}
export async function adminAccount(id: string) {
  const row = await prisma.user.findFirst({
    where: { id, role: { in: [...roles] } },
    select: accountSelect,
  });
  if (!row) throw new ApiError(404, "Account not found.");
  const reviews = await prisma.accountReview.findMany({
    where: { targetUserId: id },
    select: {
      id: true,
      actorLabel: true,
      status: true,
      note: true,
      createdAt: true,
      verificationDocument: { select: verificationFileSelect },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return {
    account: accountDto(row),
    reviews: reviews.map(({ verificationDocument, ...r }) => ({
      ...r,
      document: verificationDocument
        ? verificationFileDto(verificationDocument)
        : null,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}
export async function reviewAccount(
  input: Record<string, unknown>,
  actor: AuthAccount,
) {
  if (actor.role !== "ADMIN") throw new ApiError(403, "Access denied.");
  const id = textField(input.id, "account id", 160);
  const note = textField(input.note, "review note", 1000);
  const key = textField(input.submissionKey, "submission key", 100);
  const version = textField(input.expectedUpdatedAt, "account version", 40);
  if (note.length < 12)
    throw new ApiError(422, "Add a review note of at least 12 characters.");
  if (
    !/^[a-zA-Z0-9_-]{16,100}$/.test(key) ||
    !Number.isFinite(Date.parse(version))
  )
    throw new ApiError(422, "Check the review details.");
  if (input.action !== "APPROVE" && input.action !== "REJECT")
    throw new ApiError(422, "Choose a review decision.");
  const status = input.action === "APPROVE" ? "VERIFIED" : "REJECTED";
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM users WHERE id = ${id} FOR UPDATE`;
    const previous = await tx.accountReview.findUnique({
      where: { submissionKey: key },
    });
    if (previous) {
      if (
        previous.targetUserId !== id ||
        previous.actorUserId !== actor.id ||
        previous.note !== note ||
        previous.status !== status ||
        previous.previousUpdatedAt.toISOString() !== version ||
        (input.documentId !== undefined &&
          previous.verificationDocumentId !== input.documentId)
      )
        throw new ApiError(
          409,
          "This submission key was already used for different review details.",
        );
      return { id, status, repeated: true };
    }
    const row = await tx.user.findUnique({
      where: { id },
      select: accountSelect,
    });
    if (
      !row ||
      !row.isActive ||
      !(roles as readonly string[]).includes(row.role)
    )
      throw new ApiError(404, "Active account not found.");
    const profile = row.donorProfile || row.ngoProfile || row.volunteerProfile;
    if (!profile)
      throw new ApiError(422, "This account has no verification profile.");
    if (
      profile.updatedAt.toISOString() !== version ||
      profile.verificationStatus === "VERIFIED" ||
      profile.verificationStatus === status
    )
      throw new ApiError(
        409,
        "This account changed. Reload its details before reviewing.",
      );
    const document =
      row.ngoProfile?.verificationDocument ||
      row.volunteerProfile?.verificationDocument;
    if (
      status === "VERIFIED" &&
      (row.role === "NGO" || row.role === "VOLUNTEER") &&
      !document
    )
      throw new ApiError(
        422,
        "A verification document is required before approving this account.",
      );
    if (
      (input.documentId !== undefined && input.documentId !== document?.id) ||
      (status === "VERIFIED" && document && input.documentId !== document.id)
    )
      throw new ApiError(
        409,
        "The document changed. Reload the account before reviewing.",
      );
    const where = {
      userId: id,
      updatedAt: new Date(version),
      verificationStatus: profile.verificationStatus,
    };
    const data = { verificationStatus: status as VerificationStatus };
    const changed =
      row.role === "DONOR"
        ? await tx.donorProfile.updateMany({ where, data })
        : row.role === "NGO"
          ? await tx.nGOProfile.updateMany({ where, data })
          : await tx.volunteerProfile.updateMany({ where, data });
    if (changed.count !== 1)
      throw new ApiError(
        409,
        "This account changed. Reload its details before reviewing.",
      );
    await tx.accountReview.create({
      data: {
        targetUserId: id,
        verificationDocumentId: document?.id,
        actorUserId: actor.id,
        actorLabel: actor.displayName,
        previousStatus: profile.verificationStatus,
        status,
        note,
        submissionKey: key,
        previousUpdatedAt: new Date(version),
      },
    });
    await tx.notification.create({
      data: {
        userId: id,
        type: "SYSTEM",
        title: "Account verification updated",
        message: `${status}. ${note}`,
        href:
          row.role === "DONOR"
            ? "/donor/profile"
            : row.role === "NGO"
              ? "/ngo/verification"
              : "/volunteer/id-card",
      },
    });
    return { id, status, repeated: false };
  });
}
export async function adminRescues(params: URLSearchParams) {
  const { q, status, page, pageSize } = filters(
    params,
    ["ALL", "ACTIVE", ...active, "DISTRIBUTED", "CANCELLED", "EXPIRED"],
    "ACTIVE",
  );
  const where: Prisma.ClaimWhereInput = {
    ...(status === "ACTIVE"
      ? { status: { in: [...active] } }
      : status !== "ALL"
        ? { status: status as (typeof active)[number] }
        : {}),
    ...(q
      ? {
          OR: [
            { donation: { title: { contains: q, mode: "insensitive" } } },
            { ngo: { organizationName: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
  const [total, rows] = await prisma.$transaction(
    [
      prisma.claim.count({ where }),
      prisma.claim.findMany({
        where,
        select: rescueSelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ],
    { isolationLevel: "RepeatableRead" },
  );
  return { items: rows.map(rescueDto), total, page, pageSize };
}
export async function adminReport(id: string) {
  const row = await prisma.incidentReport.findUnique({
    where: { id },
    select: reportSelect,
  });
  if (!row) throw new ApiError(404, "Report not found.");
  return reportDto(row);
}
export async function adminReports(params: URLSearchParams) {
  const { q, status, page, pageSize } = filters(
    params,
    ["ALL", "OPEN", "SUBMITTED", "UNDER_REVIEW", "RESOLVED", "CLOSED"],
    "OPEN",
  );
  const where: Prisma.IncidentReportWhereInput = {
    ...(status === "OPEN"
      ? { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } }
      : status !== "ALL"
        ? { status: status as "SUBMITTED" }
        : {}),
    ...(q
      ? {
          OR: [
            { description: { contains: q, mode: "insensitive" } },
            {
              claim: {
                donation: { title: { contains: q, mode: "insensitive" } },
              },
            },
          ],
        }
      : {}),
  };
  const [total, rows] = await prisma.$transaction(
    [
      prisma.incidentReport.count({ where }),
      prisma.incidentReport.findMany({
        where,
        select: reportSelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ],
    { isolationLevel: "RepeatableRead" },
  );
  return { items: rows.map(reportDto), total, page, pageSize };
}
export async function adminOverview() {
  return prisma.$transaction(
    async (tx) => {
      const [
        pendingAccounts,
        openRescues,
        openReports,
        distributed,
        accounts,
        rescues,
        reports,
        accountActivity,
        reportActivity,
      ] = await Promise.all([
        tx.user.count({ where: pendingWhere }),
        tx.claim.count({ where: { status: { in: [...active] } } }),
        tx.incidentReport.count({
          where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
        }),
        tx.distributionRecord.aggregate({ _sum: { mealsDistributed: true } }),
        tx.user.findMany({
          where: pendingWhere,
          select: accountSelect,
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          take: 4,
        }),
        tx.claim.findMany({
          where: { status: { in: [...active] } },
          select: rescueSelect,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: 4,
        }),
        tx.incidentReport.findMany({
          where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
          select: reportSelect,
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          take: 3,
        }),
        tx.accountReview.findMany({
          select: {
            id: true,
            actorLabel: true,
            status: true,
            createdAt: true,
            target: { select: { displayName: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        tx.incidentReview.findMany({
          select: {
            id: true,
            actorLabel: true,
            status: true,
            decision: true,
            createdAt: true,
            incident: {
              select: {
                claim: { select: { donation: { select: { title: true } } } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]);
      const activity = [
        ...accountActivity.map((r) => ({
          id: r.id,
          actor: r.actorLabel,
          subject: r.target.displayName,
          action: r.status,
          createdAt: r.createdAt.toISOString(),
        })),
        ...reportActivity.map((r) => ({
          id: r.id,
          actor: r.actorLabel,
          subject: r.incident.claim.donation.title,
          action: r.decision || r.status,
          createdAt: r.createdAt.toISOString(),
        })),
      ]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5);
      return {
        pendingAccounts,
        openRescues,
        openReports,
        mealsDistributed: distributed._sum.mealsDistributed || 0,
        accounts: accounts.map(accountDto),
        rescues: rescues.map(rescueDto),
        reports: reports.map(reportDto),
        activity,
      };
    },
    { isolationLevel: "RepeatableRead" },
  );
}
export type AdminAccount = ReturnType<typeof accountDto>;
export type AdminRescue = ReturnType<typeof rescueDto>;
export type AdminReport = ReturnType<typeof reportDto>;
export type AdminOverview = Awaited<ReturnType<typeof adminOverview>>;
export type AdminAccountDetail = Awaited<ReturnType<typeof adminAccount>>;
export type AdminPage<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
