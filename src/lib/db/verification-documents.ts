import { lockActiveAccount } from "@/lib/db/account-access";
import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import type { AuthAccount } from "@/lib/db/accounts";
import {
  documentInputError,
  type VerificationFile,
  type VerificationState,
} from "@/features/verification/types";

export const verificationFileSelect = {
  id: true,
  originalName: true,
  mimeType: true,
  byteSize: true,
  width: true,
  height: true,
  pages: true,
  createdAt: true,
} satisfies Prisma.VerificationDocumentSelect;
export function verificationFileDto(
  row: Prisma.VerificationDocumentGetPayload<{
    select: typeof verificationFileSelect;
  }>,
): VerificationFile {
  return {
    id: row.id,
    name: row.originalName,
    mimeType: row.mimeType,
    byteSize: row.byteSize,
    width: row.width,
    height: row.height,
    pages: row.pages,
    createdAt: row.createdAt.toISOString(),
    url: `/api/verification/documents/${row.id}`,
  };
}
function participant(user: AuthAccount): "DONOR" | "NGO" | "VOLUNTEER" {
  if (user.role !== "DONOR" && user.role !== "NGO" && user.role !== "VOLUNTEER")
    throw new ApiError(
      403,
      "Only donor, NGO, and volunteer accounts can submit verification documents.",
    );
  return user.role;
}
export async function ownVerification(
  user: AuthAccount,
): Promise<VerificationState> {
  const role = participant(user);
  return prisma.$transaction(
    async (tx) => {
      const row =
        role === "DONOR"
          ? await tx.donorProfile.findUnique({
              where: { userId: user.id },
              select: {
                verificationStatus: true,
                verificationDocument: { select: verificationFileSelect },
              },
            })
          : role === "NGO"
            ? await tx.nGOProfile.findUnique({
                where: { userId: user.id },
                select: {
                  verificationStatus: true,
                  verificationDocument: { select: verificationFileSelect },
                },
              })
            : await tx.volunteerProfile.findUnique({
              where: { userId: user.id },
              select: {
                verificationStatus: true,
                verificationDocument: { select: verificationFileSelect },
              },
            });
      if (!row) throw new ApiError(404, "Verification profile not found.");
      const reviews = await tx.accountReview.findMany({
        where: { targetUserId: user.id },
        select: {
          id: true,
          status: true,
          actorLabel: true,
          note: true,
          createdAt: true,
          verificationDocument: { select: verificationFileSelect },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
      return {
        role,
        status: row.verificationStatus,
        document: row.verificationDocument
          ? verificationFileDto(row.verificationDocument)
          : null,
        reviews: reviews.map((r) => ({
          id: r.id,
          status: r.status,
          actorLabel: r.actorLabel,
          note: r.note,
          createdAt: r.createdAt.toISOString(),
          document: r.verificationDocument
            ? verificationFileDto(r.verificationDocument)
            : null,
        })),
      };
    },
    { isolationLevel: "RepeatableRead" },
  );
}
export async function submitVerification(
  file: File,
  key: string,
  user: AuthAccount,
) {
  const role = participant(user);
  if (!/^[a-zA-Z0-9_-]{16,100}$/.test(key))
    throw new ApiError(422, "Use a valid document submission key.");
  const inputIssue = documentInputError(file);
  if (inputIssue) throw new ApiError(422, inputIssue);
  const sourceHash = createHash("sha256")
    .update(file.name)
    .update("\0")
    .update(file.type)
    .update("\0")
    .update(Buffer.from(await file.arrayBuffer()))
    .digest("hex");
  const { prepareVerificationFile } = await import("@/lib/verification-file");
  const prepared = await prepareVerificationFile(file);
  return prisma.$transaction(async (tx) => {
    // Use the same lock order as account reviews so uploads and approvals serialize.
    await lockActiveAccount(tx, user.id);
    const profile =
      role === "DONOR"
        ? await tx.donorProfile.findUnique({ where: { userId: user.id } })
        : role === "NGO"
          ? await tx.nGOProfile.findUnique({ where: { userId: user.id } })
          : await tx.volunteerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) throw new ApiError(404, "Verification profile not found.");
    const previous = await tx.verificationDocument.findUnique({
      where: { ownerId_uploadKey: { ownerId: user.id, uploadKey: key } },
      select: { ...verificationFileSelect, sourceHash: true },
    });
    if (previous) {
      if (previous.sourceHash !== sourceHash)
        throw new ApiError(
          409,
          "This submission key was used for a different document.",
        );
      if (profile.verificationDocumentId !== previous.id)
        throw new ApiError(
          409,
          "A newer document is already submitted. Refresh your verification details.",
        );
      return {
        document: verificationFileDto(previous),
        status: profile.verificationStatus,
        repeated: true,
      };
    }
    if (profile.verificationStatus === "VERIFIED")
      throw new ApiError(
        409,
        "Your account is already verified. Contact an administrator to change its document.",
      );
    const stored = await tx.verificationDocument.aggregate({
      where: { ownerId: user.id },
      _sum: { byteSize: true },
    });
    if ((stored._sum.byteSize || 0) + prepared.byteSize > 20 * 1024 * 1024)
      throw new ApiError(
        422,
        "Your saved verification documents reached the storage limit. Contact an administrator.",
      );
    const document = await tx.verificationDocument.create({
      data: {
        ...prepared,
        ownerId: user.id,
        kind:
          role === "DONOR"
            ? "DONOR_LICENSE"
            : role === "NGO"
              ? "NGO_REGISTRATION"
              : "VOLUNTEER_ID",
        uploadKey: key,
        sourceHash,
      },
      select: verificationFileSelect,
    });
    if (role === "DONOR")
      await tx.donorProfile.update({
        where: { userId: user.id },
        data: {
          verificationDocumentId: document.id,
          verificationStatus: "PENDING",
        },
      });
    else if (role === "NGO")
      await tx.nGOProfile.update({
        where: { userId: user.id },
        data: {
          verificationDocumentId: document.id,
          verificationDocName: null,
          verificationStatus: "PENDING",
        },
      });
    else
      await tx.volunteerProfile.update({
        where: { userId: user.id },
        data: {
          verificationDocumentId: document.id,
          identityDocumentName: null,
          verificationStatus: "PENDING",
        },
      });
    return {
      document: verificationFileDto(document),
      status: "PENDING" as const,
      repeated: false,
    };
  });
}
export async function readVerificationFile(id: string, user: AuthAccount) {
  if (!/^[a-f0-9-]{36}$/.test(id))
    throw new ApiError(404, "Document not found for your account.");
  const row = await prisma.verificationDocument.findFirst({
    where: { id, ...(user.role !== "ADMIN" ? { ownerId: user.id } : {}) },
    select: { data: true, mimeType: true, originalName: true },
  });
  if (!row) throw new ApiError(404, "Document not found for your account.");
  return row;
}
