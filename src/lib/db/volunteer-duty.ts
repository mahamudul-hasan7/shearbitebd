import type { Prisma, VolunteerProfile } from "@prisma/client";
import type { VolunteerDuty } from "@/features/volunteer-dashboard/volunteer-duty";

import { lockActiveAccount } from "./account-access";

export async function readyVolunteerProfile(tx: Prisma.TransactionClient, userId: string, profileId: string) {
  await lockActiveAccount(tx, userId);
  const profile = await tx.volunteerProfile.findUniqueOrThrow({ where: { id: profileId, userId } });
  if (!["PENDING", "NOT_SUBMITTED"].includes(profile.verificationStatus)) return profile;
  const approved = await tx.volunteerProfile.update({
    where: { id: profile.id },
    data: { verificationStatus: "VERIFIED", dutyVersion: { increment: 1 } },
  });
  await tx.notification.create({ data: {
    userId, type: "SYSTEM", title: "Account approved",
    message: "Your account has been approved automatically. You can start using it now.",
    href: "/volunteer/dashboard",
  } });
  return approved;
}

export function volunteerDutyDto(profile: Pick<VolunteerProfile, "id" | "isOnDuty" | "dutyStartedAt" | "dutyVersion" | "verificationStatus">, hasActiveMission = false): VolunteerDuty {
  return { volunteerProfileId: profile.id, isOnDuty: profile.isOnDuty, startedAt: profile.dutyStartedAt?.toISOString() ?? null,
    version: profile.dutyVersion, canGoOnDuty: profile.verificationStatus === "VERIFIED", hasActiveMission };
}
