import {
  Building2,
  ClipboardList,
  HeartHandshake,
  Home,
  PackageSearch,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import type { NavigationItem, PortalRole } from "@/types/navigation";
import { ROUTES } from "@/lib/routes";
import { USER_ROLE_META, UserRole } from "@/lib/constants/roles";

export const donorNavigation: NavigationItem[] = [
  { label: "Home", href: ROUTES.donor.dashboard, icon: Home },
  { label: "Donations", href: ROUTES.donor.donations, icon: PackageSearch },
  { label: "Add Food", href: ROUTES.donor.newDonation, icon: Plus, isPrimary: true },
  { label: "NGOs", href: ROUTES.donor.ngos, icon: Building2 },
  { label: "Profile", href: ROUTES.donor.profile, icon: UserRound },
];

export const ngoNavigation: NavigationItem[] = [
  { label: "Home", href: ROUTES.ngo.dashboard, icon: Home },
  { label: "Discover", href: ROUTES.ngo.discover, icon: Search },
  { label: "Request", href: ROUTES.ngo.newRequest, icon: Plus, isPrimary: true },
  { label: "Claims", href: ROUTES.ngo.claims, icon: ClipboardList },
  { label: "Profile", href: ROUTES.ngo.profile, icon: UserRound },
];

export const roleMeta: Record<PortalRole, { label: string; description: string }> = {
  donor: USER_ROLE_META[UserRole.DONOR],
  ngo: USER_ROLE_META[UserRole.NGO],
};

export function getNavigation(role: PortalRole, preview = false) {
  const navigation = role === "donor" ? donorNavigation : ngoNavigation;
  if (!preview) return navigation;

  return navigation.map((item, index) =>
    index === 0
      ? { ...item, href: role === "donor" ? ROUTES.preview.donor : ROUTES.preview.ngo }
      : item,
  );
}

export const productLinks = [
  { label: "Design System", href: ROUTES.designSystem, icon: HeartHandshake },
  { label: "Donor Preview", href: ROUTES.preview.donor, icon: PackageSearch },
  { label: "NGO Preview", href: ROUTES.preview.ngo, icon: Building2 },
];
