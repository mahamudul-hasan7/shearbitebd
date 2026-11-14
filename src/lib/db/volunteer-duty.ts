import type { VolunteerProfile } from "@prisma/client";
import type { VolunteerDuty } from "@/features/volunteer-dashboard/volunteer-duty";

export function volunteerDutyDto(profile: Pick<VolunteerProfile, "id" | "isOnDuty" | "dutyStartedAt" | "dutyVersion" | "verificationStatus">, hasActiveMission = false): VolunteerDuty {
  return { volunteerProfileId: profile.id, isOnDuty: profile.isOnDuty, startedAt: profile.dutyStartedAt?.toISOString() ?? null,
    version: profile.dutyVersion, canGoOnDuty: profile.verificationStatus === "VERIFIED", hasActiveMission };
}
