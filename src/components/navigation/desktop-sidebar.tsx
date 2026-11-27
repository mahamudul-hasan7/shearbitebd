"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { ArrowUpRight, LogOut } from "lucide-react";
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
  const { session, signOut } = useMockAuth();
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
      className={`${theme.sidebar} fixed inset-y-0 left-0 z-40 hidden w-[var(--sidebar-width)] flex-col border-r lg:flex`}
    >
      <div className="p-4 pb-3">
        <BrandLogo inverse />
        <div className="mt-3">
          <RoleBadge role={role} inverse />
        </div>
      </div>
      <p className={theme.sidebarSectionLabel}>{tx("MANAGE")}</p>
      <nav
        ref={navigation}
        aria-label={tx("Account sidebar")}
        className={`${theme.sidebarNav} grid flex-1 content-start gap-1 px-3 pb-3`}
      >
        <span
          ref={selection}
          className={theme.sidebarSelection}
          aria-hidden="true"
          data-testid="sidebar-nav-selection"
        />
        {items.map((item) => {
          const active = selected === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={theme.sidebarLink}
            >
              <LiveIcon
                icon={item.icon}
                motion={active ? "once" : "interaction"}
                className="size-4.5 shrink-0"
              />
              <span className="flex-1 truncate">{tx(item.label)}</span>
              {item.href.endsWith("/notifications") && unread > 0 && (
                <span
                  aria-label={tx("{0} unread notifications", unread)}
                  className="rounded-full bg-red-600 px-2 text-xs text-white"
                >
                  {unread}
                </span>
              )}
              {active && (
                <ArrowUpRight className="size-4 shrink-0 text-white/75" aria-hidden="true" />
              )}
              <NavigationFeedback />
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/12 p-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15 text-xs font-extrabold text-white ring-1 ring-white/20">
            {(session?.displayName || profileName || "U").slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">
              {session?.displayName || profileName || "My account"}
            </p>
            <p className="truncate text-[11px] text-white/65">
              {session?.email || "Account preview"}
            </p>
          </div>
          <button
            type="button"
            aria-label={tx("Log out")}
            title={tx("Log out")}
            onClick={() => void signOut()}
            className="grid size-9 shrink-0 place-items-center rounded-xl text-white/80 hover:bg-white/12 hover:text-white transition cursor-pointer"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
