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
  const { session } = useMockAuth();
  const { activeMission } = useVolunteerStore();
  const feed = useNotificationFeed();
  const unread = feed.notifications.filter((item) => !item.read).length;
  const items = (
    getNavigation(role, activeHref.startsWith("/preview/")) as DesktopNavItem[]
  ).map((item) =>
    role === "volunteer" &&
    item.href.endsWith("#active-mission") &&
    activeMission
      ? { ...item, href: ROUTES.volunteer.mission(activeMission.id) }
      : item,
  );
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
        aria-label={tx("Account sidebar")}
        className="grid flex-1 content-start gap-1 overflow-y-auto p-3"
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={activeHref === item.href ? "page" : undefined}
            className={theme.sidebarLink}
          >
            <LiveIcon icon={item.icon} className="size-4 shrink-0" />
            <span className="flex-1">{tx(item.label)}</span>
            {item.href.endsWith("/notifications") && unread > 0 && (
              <span
                aria-label={tx("{0} unread notifications", unread)}
                className="rounded-full bg-red-600 px-2 text-xs text-white"
              >
                {unread}
              </span>
            )}
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
