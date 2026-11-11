"use client";

import Link from "next/link";
import {
  Bell,
  Bike,
  ClipboardList,
  History,
  LayoutDashboard,
  Navigation,
  PackageSearch,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { PortalRole } from "@/types/navigation";

interface MobileTabItem {
  label: string;
  href: string;
  icon: LucideIcon;
  isPrimary?: boolean;
  isNotification?: boolean;
}

function getMobileTabs(role: PortalRole): MobileTabItem[] {
  switch (role) {
    case "donor":
      return [
        { label: "হোম", href: ROUTES.donor.dashboard, icon: LayoutDashboard },
        { label: "অনুদান", href: ROUTES.donor.donations, icon: PackageSearch },
        { label: "পোস্ট", href: ROUTES.donor.newDonation, icon: Plus, isPrimary: true },
        { label: "অ্যালার্ট", href: ROUTES.donor.notifications, icon: Bell, isNotification: true },
        { label: "প্রোফাইল", href: ROUTES.donor.profile, icon: UserRound },
      ];
    case "ngo":
      return [
        { label: "হোম", href: ROUTES.ngo.dashboard, icon: LayoutDashboard },
        { label: "খাদ্য খুঁজুন", href: ROUTES.ngo.discover, icon: Search },
        { label: "চাহিদা", href: ROUTES.ngo.newRequest, icon: Plus, isPrimary: true },
        { label: "ক্লেইম", href: ROUTES.ngo.claims, icon: ClipboardList },
        { label: "অ্যালার্ট", href: ROUTES.ngo.notifications, icon: Bell, isNotification: true },
      ];
    case "volunteer":
    default:
      return [
        { label: "কমান্ড", href: ROUTES.volunteer.dashboard, icon: LayoutDashboard },
        { label: "ডিসপ্যাচ", href: ROUTES.volunteer.dispatches, icon: Navigation },
        { label: "মিশন", href: ROUTES.volunteer.mission("mission-uiu-mastul"), icon: Bike, isPrimary: true },
        { label: "হিস্ট্রি", href: ROUTES.volunteer.history, icon: History },
        { label: "আইডি কার্ড", href: ROUTES.volunteer.idCard, icon: ShieldCheck },
      ];
  }
}

export function MobileBottomNavigation({
  role,
  activeHref,
  unreadNotifications = 0,
}: {
  role: PortalRole;
  activeHref: string;
  unreadNotifications?: number;
}) {
  const items = getMobileTabs(role);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full border-t border-slate-200/80 bg-white/85 backdrop-blur-xl backdrop-saturate-150 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] lg:hidden transition-all duration-300 pointer-events-auto"
      style={{ paddingBottom: "max(0.6rem, env(safe-area-inset-bottom))" }}
      aria-label="Mobile Bottom App Navigation"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === activeHref ||
            (item.href !== ROUTES.donor.dashboard &&
              item.href !== ROUTES.ngo.dashboard &&
              item.href !== ROUTES.volunteer.dashboard &&
              activeHref.startsWith(item.href));

          // 1. Center Floating Action Button (FAB)
          if (item.isPrimary) {
            return (
              <div key={item.label} className="relative -top-3.5 flex flex-col items-center">
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className="flex size-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-[0_8px_20px_rgba(5,150,105,0.4)] ring-4 ring-white active:scale-90 transition-all duration-150 group cursor-pointer"
                  aria-label={item.label}
                >
                  <Icon className="size-6 transition-transform group-hover:scale-110" aria-hidden="true" />
                </Link>
                <span className="mt-1 text-[10px] font-black tracking-tight text-emerald-800">
                  {item.label}
                </span>
              </div>
            );
          }

          // 2. Standard Mobile Bottom App Tab
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1 text-center transition-all duration-150 active:scale-95 cursor-pointer",
                isActive ? "text-emerald-800 font-extrabold" : "text-slate-500 hover:text-slate-900 font-medium",
              )}
            >
              <div
                className={cn(
                  "relative flex size-9 items-center justify-center rounded-xl transition-all duration-200",
                  isActive ? "bg-emerald-100/70 text-emerald-800 scale-105" : "text-slate-500",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />

                {/* Live Unread Notification Dot/Badge */}
                {item.isNotification && unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-xs ring-2 ring-white animate-pulse">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-tight tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export const MobileBottomNav = MobileBottomNavigation;
