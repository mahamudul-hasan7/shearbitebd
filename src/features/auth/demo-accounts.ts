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

export function findDemoAccount(email: string) {
  return DEMO_ACCOUNTS.find((account) => account.email.toLowerCase() === email.trim().toLowerCase());
}
