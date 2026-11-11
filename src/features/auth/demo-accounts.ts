import { UserRole } from "@/lib/constants/roles";

export interface DemoAccount {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
}

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  { email: "donor@sharebite.demo", password: "Demo1234", displayName: "UIU Cafeteria", role: UserRole.DONOR },
  { email: "ngo@sharebite.demo", password: "Demo1234", displayName: "Hope Foundation", role: UserRole.NGO },
  { email: "volunteer@sharebite.demo", password: "Demo1234", displayName: "Demo Volunteer", role: UserRole.VOLUNTEER },
];

export function findDemoAccount(query: string) {
  const clean = (query || "").trim().toLowerCase();
  if (!clean) return undefined;
  const digits = clean.replace(/\D/g, "");
  return DEMO_ACCOUNTS.find((account) => {
    if (account.email.toLowerCase() === clean) return true;
    if (clean === "donor" && account.role === UserRole.DONOR) return true;
    if (clean === "ngo" && account.role === UserRole.NGO) return true;
    if (clean === "volunteer" && account.role === UserRole.VOLUNTEER) return true;
    if (account.email.toLowerCase().startsWith(clean + "@")) return true;
    if (digits.length >= 7 && (digits.endsWith("000001") || digits.endsWith("000002") || digits.endsWith("000003"))) {
      if (digits.endsWith("000001") && account.role === UserRole.DONOR) return true;
      if (digits.endsWith("000002") && account.role === UserRole.NGO) return true;
      if (digits.endsWith("000003") && account.role === UserRole.VOLUNTEER) return true;
    }
    return false;
  });
}
