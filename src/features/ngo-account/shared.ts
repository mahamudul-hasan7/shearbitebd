import { UserRole } from "@/lib/constants/roles";
import type { ViewerContext } from "@/types/domain";

export const NGO_ACCOUNT_USER_ID = "user-ngo-hope";
export const NGO_ACCOUNT_PROFILE_ID = "ngo-hope";
export const NGO_ACCOUNT_VIEWER: ViewerContext = { userId: NGO_ACCOUNT_USER_ID, ngoProfileId: NGO_ACCOUNT_PROFILE_ID, role: UserRole.NGO };

export function formatNgoAccountDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
