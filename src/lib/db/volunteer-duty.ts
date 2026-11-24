import type { Prisma, VolunteerProfile } from "@prisma/client";
import type { VolunteerDuty } from "@/features/volunteer-dashboard/volunteer-duty";

import { lockActiveAccount } from "./account-access";

export async function lockedVolunteerProfile(tx: Prisma.TransactionClient, userId: string, profileId: string) {
  await lockActiveAccount(tx, userId);
  return tx.volunteerProfile.findUniqueOrThrow({ where: { id: profileId, userId } });
}

export function volunteerDutyDto(profile: Pick<VolunteerProfile, "id" | "isOnDuty" | "dutyStartedAt" | "dutyVersion" | "verificationStatus">, hasActiveMission = false): VolunteerDuty {
  return { volunteerProfileId: profile.id, isOnDuty: profile.isOnDuty, startedAt: profile.dutyStartedAt?.toISOString() ?? null,
    version: profile.dutyVersion, canGoOnDuty: profile.verificationStatus === "VERIFIED", hasActiveMission };
}
