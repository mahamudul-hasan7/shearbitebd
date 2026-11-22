"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { RoleBadge } from "@/components/portal/role-badge";
import theme from "@/components/portal/portal-theme.module.css";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { getNavigation, type DesktopNavItem } from "@/lib/navigation";
import { useMockAuth } from "@/features/auth/mock-auth";
import { useNotificationFeed } from "@/lib/notifications/use-notification-feed";
import { useVolunteerStore } from "@/features/volunteer-dashboard/volunteer-store";
import { ROUTES } from "@/lib/routes";
import type { PortalRole } from "@/types/navigation";
import { LiveIcon } from "@/components/motion/live-icon";
import { useRef } from "react";
import { usePathname } from "next/navigation";
import { useNavigationSelection } from "./navigation-motion";
import { missionNavigation, selectedNavigationHref } from "./navigation-state";
import { NavigationFeedback } from "./navigation-feedback";

export function DesktopSidebar({
  role,
  activeHref,
  profileName,
}: {
  role: PortalRole;
  activeHref: string;
  profileName?: string;
  profileDescription?: string;
  avatarInitials?: string;
}) {
  const tx = useUiText();
  const pathname = usePathname();
  const navigation = useRef<HTMLElement>(null);
  const selection = useRef<HTMLSpanElement>(null);
  const { session } = useMockAuth();
  const { activeMission } = useVolunteerStore();
  const feed = useNotificationFeed();
  const unread = feed.notifications.filter((item) => !item.read).length;
  const items = missionNavigation(
    getNavigation(role, activeHref.startsWith("/preview/")) as DesktopNavItem[],
    role === "volunteer" && activeMission
      ? ROUTES.volunteer.mission(activeMission.id)
      : undefined,
  );
  const selected = selectedNavigationHref(items, activeHref, pathname);
  useNavigationSelection(navigation, selection, selected);
  return (
    <aside
      className={`${theme.sidebar} fixed inset-y-0 left-0 z-40 hidden w-[var(--sidebar-width)] flex-col border-r text-white lg:flex`}
    >
      <div className="border-b border-white/10 p-5">
        <BrandLogo inverse />
        <div className="mt-4">
          <RoleBadge role={role} inverse />
        </div>
      </div>
      <nav
        ref={navigation}
        aria-label={tx("Account sidebar")}
        className={`${theme.sidebarNav} grid flex-1 content-start gap-1 overflow-y-auto p-3`}
      >
        <span
          ref={selection}
          className={theme.sidebarSelection}
          aria-hidden="true"
          data-testid="sidebar-nav-selection"
        />
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={selected === item.href ? "page" : undefined}
            className={theme.sidebarLink}
          >
            <LiveIcon
              icon={item.icon}
              motion={selected === item.href ? "once" : "interaction"}
              className="size-4 shrink-0"
            />
            <span className="flex-1">{tx(item.label)}</span>
            {item.href.endsWith("/notifications") && unread > 0 && (
              <span
                aria-label={tx("{0} unread notifications", unread)}
                className="rounded-full bg-red-600 px-2 text-xs text-white"
              >
                {unread}
              </span>
            )}
            <NavigationFeedback />
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/10 p-5">
        <p className="truncate text-sm font-bold">
          {session?.displayName || profileName || "My account"}
        </p>
        <p className="mt-1 truncate text-xs text-white/65">
          {session?.email || "Account preview"}
        </p>
      </div>
    </aside>
  );
}
