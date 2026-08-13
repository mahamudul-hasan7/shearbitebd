import { UserRole } from "@/lib/constants/roles";
import type { ViewerContext } from "@/types/domain";

export const DONOR_USER_ID = "user-donor-uiu";
export const DONOR_PROFILE_ID = "donor-uiu";
export const DONOR_VIEWER: ViewerContext = { userId: DONOR_USER_ID, donorProfileId: DONOR_PROFILE_ID, role: UserRole.DONOR };

export function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "FD";
}

export function formatAccountDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
