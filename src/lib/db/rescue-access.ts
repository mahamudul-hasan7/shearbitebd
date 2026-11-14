import type { Prisma } from "@prisma/client";
import type { AuthAccount } from "@/lib/db/accounts";

export const REPORTABLE_CLAIM_STATUSES = ["RESERVED", "ASSIGNED", "PICKED_UP", "DELIVERED", "DISPUTED", "DISTRIBUTED"] as const;

export function claimVisibility(user: AuthAccount): Prisma.ClaimWhereInput {
  if (user.role === "ADMIN") return {};
  if (user.role === "DONOR") return { donation: { donorProfileId: user.donorProfileId ?? "__none__" } };
  if (user.role === "NGO") return { ngoProfileId: user.ngoProfileId ?? "__none__" };
  return { volunteerProfileId: user.volunteerProfileId ?? "__none__" };
}

export const activeVolunteerMission = {
  OR: [{ status: { in: ["ASSIGNED", "PICKED_UP"] } }, { status: "DISPUTED", incidentHoldStatus: { in: ["ASSIGNED", "PICKED_UP"] } }],
} satisfies Prisma.ClaimWhereInput;
