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

export const donorNavigation: NavigationItem[] = [
  { label: "Home", href: "/preview/donor", icon: Home },
  { label: "Donations", href: "#donations", icon: PackageSearch },
  { label: "Add Food", href: "#add-food", icon: Plus, isPrimary: true },
  { label: "NGOs", href: "#ngos", icon: Building2 },
  { label: "Profile", href: "#profile", icon: UserRound },
];

export const ngoNavigation: NavigationItem[] = [
  { label: "Home", href: "/preview/ngo", icon: Home },
  { label: "Discover", href: "#discover", icon: Search },
  { label: "Request", href: "#request", icon: Plus, isPrimary: true },
  { label: "Claims", href: "#claims", icon: ClipboardList },
  { label: "Profile", href: "#profile", icon: UserRound },
];

export const roleMeta: Record<PortalRole, { label: string; description: string }> = {
  donor: {
    label: "Food Donor",
    description: "Post, track and measure surplus food donations.",
  },
  ngo: {
    label: "NGO / Organization",
    description: "Discover, claim and distribute rescued food.",
  },
};

export function getNavigation(role: PortalRole) {
  return role === "donor" ? donorNavigation : ngoNavigation;
}

export const productLinks = [
  { label: "Design System", href: "/design-system", icon: HeartHandshake },
  { label: "Donor Preview", href: "/preview/donor", icon: PackageSearch },
  { label: "NGO Preview", href: "/preview/ngo", icon: Building2 },
];
