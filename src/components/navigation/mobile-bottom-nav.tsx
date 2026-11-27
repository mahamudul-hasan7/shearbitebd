"use client";
import { useLanguage } from "@/lib/i18n/language-context";
import { useUiText } from "@/lib/i18n/use-ui-text";

import Link from "next/link";
import {
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type PointerEvent,
} from "react";
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
import { useVolunteerStore } from "@/features/volunteer-dashboard/volunteer-store";
import { useNotificationFeed } from "@/lib/notifications/use-notification-feed";
import type { PortalRole } from "@/types/navigation";
import { LiveIcon } from "@/components/motion/live-icon";
import styles from "./mobile-bottom-nav.module.css";
import { NAVIGATION_MOTION } from "./navigation-motion";
import { NavigationFeedback } from "./navigation-feedback";

// Visual tab positions only; no account information is retained here.
const lastSelection = new Map<PortalRole, number>();
const dashboardHrefs = new Set<string>([
  ROUTES.donor.dashboard,
  ROUTES.ngo.dashboard,
  ROUTES.volunteer.dashboard,
]);

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
        {
          label: "পোস্ট",
          href: ROUTES.donor.newDonation,
          icon: Plus,
          isPrimary: true,
        },
        {
          label: "অ্যালার্ট",
          href: ROUTES.donor.notifications,
          icon: Bell,
          isNotification: true,
        },
        { label: "প্রোফাইল", href: ROUTES.donor.profile, icon: UserRound },
      ];
    case "ngo":
      return [
        { label: "হোম", href: ROUTES.ngo.dashboard, icon: LayoutDashboard },
        { label: "খাদ্য খুঁজুন", href: ROUTES.ngo.discover, icon: Search },
        {
          label: "চাহিদা",
          href: ROUTES.ngo.newRequest,
          icon: Plus,
          isPrimary: true,
        },
        { label: "ক্লেইম", href: ROUTES.ngo.claims, icon: ClipboardList },
        {
          label: "অ্যালার্ট",
          href: ROUTES.ngo.notifications,
          icon: Bell,
          isNotification: true,
        },
      ];
    case "volunteer":
    default:
      return [
        {
          label: "কমান্ড",
          href: ROUTES.volunteer.dashboard,
          icon: LayoutDashboard,
        },
        {
          label: "ডিসপ্যাচ",
          href: ROUTES.volunteer.dispatches,
          icon: Navigation,
        },
        {
          label: "মিশন",
          href: ROUTES.volunteer.dashboard + "#active-mission",
          icon: Bike,
          isPrimary: true,
        },
        { label: "হিস্ট্রি", href: ROUTES.volunteer.history, icon: History },
        {
          label: "আইডি কার্ড",
          href: ROUTES.volunteer.idCard,
          icon: ShieldCheck,
        },
      ];
  }
}

export function MobileBottomNavigation({
  role,
  activeHref,
}: {
  role: PortalRole;
  activeHref: string;
  unreadNotifications?: number;
}) {
  const tx = useUiText();
  const { language } = useLanguage();
  const { activeMission } = useVolunteerStore();
  const feed = useNotificationFeed();
  const unreadNotifications = feed.notifications.filter(
    (item) => !item.read,
  ).length;
  const items = getMobileTabs(role).map((item) =>
    role === "volunteer" &&
    item.href.endsWith("#active-mission") &&
    activeMission
      ? { ...item, href: ROUTES.volunteer.mission(activeMission.id) }
      : item,
  );
  const isTabActive = (href: string) =>
    href === activeHref ||
    (!dashboardHrefs.has(href) && activeHref.startsWith(href));
  const activeIndex = items.findIndex(
    (item) => !item.isPrimary && isTabActive(item.href),
  );
  const selection = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (activeIndex < 0) return;
    const previous = lastSelection.get(role);
    lastSelection.set(role, activeIndex);
    const element = selection.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (
      !element ||
      !element.getClientRects().length ||
      previous === undefined ||
      previous === activeIndex ||
      preference.matches ||
      document.hidden ||
      typeof element.animate !== "function"
    )
      return;
    const step = element.getBoundingClientRect().width + 2;
    const animation = element.animate(
      [
        { transform: `translateX(${previous * step}px)` },
        { transform: `translateX(${activeIndex * step}px)` },
      ],
      NAVIGATION_MOTION,
    );
    const stop = () => {
      if (preference.matches) animation.cancel();
    };
    preference.addEventListener("change", stop);
    return () => {
      animation.cancel();
      preference.removeEventListener("change", stop);
    };
  }, [role, activeIndex]);

  function reflectTouch(event: PointerEvent<HTMLElement>) {
    const element = event.currentTarget;
    const box = element.getBoundingClientRect();
    element.style.setProperty("--glass-x", `${event.clientX - box.left}px`);
    element.style.setProperty("--glass-y", `${event.clientY - box.top}px`);
  }

  return (
    <nav
      className={styles.shell}
      style={{ "--active-tab": Math.max(activeIndex, 0) } as CSSProperties}
      onPointerDown={reflectTouch}
      onPointerMove={reflectTouch}
      aria-label={tx("Mobile Bottom App Navigation")}
      data-testid="mobile-bottom-nav"
      data-role={role}
      data-active-index={activeIndex}
    >
      <div className={styles.items}>
        <span
          ref={selection}
          className={styles.selection}
          aria-hidden="true"
          data-visible={activeIndex >= 0}
          data-testid="mobile-nav-selection"
        />
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = isTabActive(item.href);

          // 1. Center Floating Action Button (FAB)
          if (item.isPrimary) {
            return (
              <div key={item.label} className={styles.primaryItem}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={styles.primaryAction}
                  aria-label={tx(item.label)}
                  data-testid={
                    role === "donor" ? "donor-mobile-post-action" : undefined
                  }
                >
                  <LiveIcon icon={Icon} className={styles.primaryIcon} />
                  <NavigationFeedback />
                </Link>
                <span className={styles.primaryLabel}>
                  {item.label === "মিশন"
                    ? language === "bn"
                      ? "মিশন"
                      : "Mission"
                    : tx(item.label)}
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
              className={styles.tab}
            >
              <div className={styles.iconWrap}>
                <LiveIcon
                  icon={Icon}
                  key={`${item.href}-${isActive}`}
                  motion={isActive ? "once" : "interaction"}
                  className={styles.icon}
                />

                {/* Live Unread Notification Dot/Badge */}
                {item.isNotification && unreadNotifications > 0 && (
                  <span className={styles.badge}>
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </div>
              <span className={styles.label}>
                {item.label === "ডিসপ্যাচ"
                  ? language === "bn"
                    ? "ডিসপ্যাচ"
                    : "Dispatches"
                  : tx(item.label)}
              </span>
              <NavigationFeedback />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export const MobileBottomNav = MobileBottomNavigation;
