import {
  Bell,
  Bike,
  Building2,
  CheckCircle2,
  ClipboardList,
  Compass,
  FileQuestion,
  HeartHandshake,
  History,
  Home,
  LayoutDashboard,
  MapPin,
  Navigation,
  PackageSearch,
  Plus,
  QrCode,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PortalRole } from "@/types/navigation";
import { ROUTES } from "@/lib/routes";
import { USER_ROLE_META, UserRole } from "@/lib/constants/roles";

export interface DesktopNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  isPrimary?: boolean;
  category?: "main" | "operations" | "system";
}

export const donorDesktopNavigation: DesktopNavItem[] = [
  { label: "ওভারভিউ হাব", href: ROUTES.donor.dashboard, icon: LayoutDashboard, category: "main" },
  { label: "আমার অনুদানসমূহ", href: ROUTES.donor.donations, icon: PackageSearch, category: "operations", badge: "লাইভ" },
  { label: "উদ্বৃত্ত খাবার পোস্ট", href: ROUTES.donor.newDonation, icon: Plus, category: "operations", isPrimary: true },
  { label: "পার্টনার এনজিও", href: ROUTES.donor.ngos, icon: Building2, category: "operations", badge: "ভেরিফায়েড" },
  { label: "পিকআপ ঠিকানা", href: ROUTES.donor.addresses, icon: MapPin, category: "operations" },
  { label: "নোটিফিকেশন", href: ROUTES.donor.notifications, icon: Bell, category: "system" },
  { label: "দাতা প্রোফাইল ও সনদ", href: ROUTES.donor.profile, icon: ShieldCheck, category: "system" },
  { label: "অ্যাকাউন্ট সেটিংস", href: ROUTES.donor.settings, icon: Settings, category: "system" },
  { label: "সহায়তা কেন্দ্র", href: ROUTES.donor.support, icon: FileQuestion, category: "system" },
];

export const ngoDesktopNavigation: DesktopNavItem[] = [
  { label: "ওভারভিউ হাব", href: ROUTES.ngo.dashboard, icon: LayoutDashboard, category: "main" },
  { label: "উদ্বৃত্ত খাদ্য অনুসন্ধান", href: ROUTES.ngo.discover, icon: Search, category: "operations", badge: "কাছাকাছি" },
  { label: "রেসকিউ রাডার ম্যাপ", href: ROUTES.ngo.discoverMap, icon: Compass, category: "operations" },
  { label: "ক্লেইমকৃত উদ্ধারসমূহ", href: ROUTES.ngo.claims, icon: ClipboardList, category: "operations", badge: "সক্রিয়" },
  { label: "খাদ্য চাহিদা দাখিল", href: ROUTES.ngo.newRequest, icon: Plus, category: "operations", isPrimary: true },
  { label: "নোটিফিকেশন", href: ROUTES.ngo.notifications, icon: Bell, category: "system" },
  { label: "এনজিও ভেরিফিকেশন ও প্রোফাইল", href: ROUTES.ngo.profile, icon: ShieldCheck, category: "system" },
  { label: "অ্যাকাউন্ট সেটিংস", href: ROUTES.ngo.settings, icon: Settings, category: "system" },
  { label: "সহায়তা ও হেল্পডেস্ক", href: ROUTES.ngo.support, icon: FileQuestion, category: "system" },
];

export const volunteerDesktopNavigation: DesktopNavItem[] = [
  { label: "কমান্ড হাব", href: ROUTES.volunteer.dashboard, icon: LayoutDashboard, category: "main" },
  { label: "লাইভ মিশন", href: ROUTES.volunteer.mission("mission-uiu-mastul"), icon: Bike, category: "operations", badge: "লাইভ" },
  { label: "উন্মুক্ত ডিসপ্যাচ", href: ROUTES.volunteer.dispatches, icon: Navigation, category: "operations", badge: "৪টি নতুন" },
  { label: "মিশন হিস্ট্রি", href: ROUTES.volunteer.history, icon: History, category: "operations", badge: "৪৮টি" },
  { label: "নোটিফিকেশন ও অ্যালার্ট", href: ROUTES.volunteer.notifications, icon: Bell, category: "system" },
  { label: "ভলান্টিয়ার আইডি কার্ড", href: ROUTES.volunteer.idCard, icon: ShieldCheck, category: "system" },
];

// Fallback for legacy mobile nav if referenced anywhere
export const donorNavigation = donorDesktopNavigation.slice(0, 5);
export const ngoNavigation = ngoDesktopNavigation.slice(0, 5);
export const volunteerNavigation = volunteerDesktopNavigation.slice(0, 5);

export const roleMeta: Record<PortalRole, { label: string; description: string }> = {
  donor: USER_ROLE_META[UserRole.DONOR],
  ngo: USER_ROLE_META[UserRole.NGO],
  volunteer: USER_ROLE_META[UserRole.VOLUNTEER],
};

export function getNavigation(role: PortalRole, preview = false) {
  const navigation =
    role === "donor"
      ? donorDesktopNavigation
      : role === "ngo"
        ? ngoDesktopNavigation
        : volunteerDesktopNavigation;

  if (!preview) return navigation;

  return navigation.map((item, index) =>
    index === 0
      ? { ...item, href: role === "donor" ? ROUTES.preview.donor : role === "ngo" ? ROUTES.preview.ngo : ROUTES.volunteer.dashboard }
      : item,
  );
}

export const productLinks = [
  { label: "ডিজাইন সিস্টেম", href: ROUTES.designSystem, icon: HeartHandshake },
  { label: "ডোনার প্রিভিউ", href: ROUTES.preview.donor, icon: PackageSearch },
  { label: "এনজিও প্রিভিউ", href: ROUTES.preview.ngo, icon: Building2 },
];
