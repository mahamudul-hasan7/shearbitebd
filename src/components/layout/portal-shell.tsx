"use client";

import { useUiText } from "@/lib/i18n/use-ui-text";
import { useContext, useLayoutEffect, useRef, type ReactNode } from "react";
import { PortalFrameContext } from "./portal-frame";
import { usePageEntrance } from "@/components/navigation/navigation-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { DesktopSidebar } from "@/components/navigation/desktop-sidebar";
import { MobileBottomNavigation } from "@/components/navigation/mobile-bottom-nav";
import { cn } from "@/lib/utils";
import type { PortalRole } from "@/types/navigation";
import { PortalTheme } from "@/components/portal/portal-theme";
import { DemoRoleSwitcher } from "@/components/portal/demo-role-switcher";
import theme from "@/components/portal/portal-theme.module.css";

export function PortalShell({
  role,
  activeHref,
  title,
  description,
  actions,
  actionsClassName,
  backHref,
  backLabel = "ফিরে যান",
  hideMobileNav = false,
  profileName,
  profileDescription,
  avatarInitials,
  notificationHref,
  unreadNotifications,
  compactHeader = false,
  titleClassName,
  children,
}: {
  role: PortalRole;
  activeHref: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  actionsClassName?: string;
  backHref?: string;
  backLabel?: string;
  hideMobileNav?: boolean;
  profileName?: string;
  profileDescription?: string;
  avatarInitials?: string;
  notificationHref?: string;
  unreadNotifications?: number;
  compactHeader?: boolean;
  titleClassName?: string;
  children: ReactNode;
}) {
  const tx = useUiText();
  const pathname = usePathname();
  const frame = useContext(PortalFrameContext);
  const main = useRef<HTMLElement>(null);
  const previewPath = useRef<string | null>(null);
  usePageEntrance(main, pathname, frame?.previousPath || previewPath);
  useLayoutEffect(() => {
    frame?.updatePage({
      pathname,
      activeHref,
      hideMobileNav,
      profileName,
      profileDescription,
      avatarInitials,
      notificationHref,
    });
  }, [
    frame,
    pathname,
    activeHref,
    hideMobileNav,
    profileName,
    profileDescription,
    avatarInitials,
    notificationHref,
  ]);
  const shouldHideMobileNav =
    hideMobileNav ||
    /\/(new|edit|tracking|confirm-delivery|distribution)\/?$/.test(pathname) ||
    pathname.includes("/missions/") ||
    activeHref.endsWith("/new") ||
    activeHref.includes("/tracking") ||
    activeHref.includes("/confirm-delivery") ||
    activeHref.includes("/missions/");

  const content = (
    <PageContainer
      className={cn(
        "flex-1 pt-4 sm:pt-8",
        shouldHideMobileNav
          ? "pb-8 sm:pb-12"
          : "pb-[calc(9.5rem+env(safe-area-inset-bottom))] lg:pb-24",
      )}
    >
      <main ref={main} data-portal-page={pathname} className="relative z-[1] min-w-0">
        {/* Dedicated Left-Aligned Back Navigation */}
        {backHref && (
          <div className="mb-4">
            <Link
              href={backHref}
              className={`${theme.backLink} liquid-glass-pill inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all`}
            >
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
              <span>{backLabel}</span>
            </Link>
          </div>
        )}

        <div
          className={cn(
            compactHeader
              ? "mb-5 flex flex-col gap-3 sm:mb-8"
              : "mb-8 flex flex-col gap-4",
            "sm:flex-row sm:items-center sm:justify-between",
          )}
        >
          <div className="min-w-0 flex-1">
            <div
              className={cn(
                "items-center gap-2",
                compactHeader ? "hidden sm:flex" : "flex",
              )}
            >
              <span className={theme.workspaceLabel}>
                <span className="size-1.5 rounded-full bg-current" />
                {role === "donor"
                  ? tx("দাতা ওয়ার্কস্পেস · বাংলাদেশ")
                  : role === "volunteer"
                    ? tx("ভলান্টিয়ার স্কোয়াড · বাংলাদেশ")
                    : tx("এনজিও ওয়ার্কস্পেস · বাংলাদেশ")}
              </span>
            </div>
            <h1
              className={cn(
                "mt-2 text-2xl font-black tracking-tight text-ink-900 sm:text-3xl lg:text-4xl",
                titleClassName,
              )}
            >
              {title}
            </h1>
            {description && (
              <p
                className={cn(
                  "mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-600",
                  compactHeader && "hidden sm:block",
                )}
              >
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div
              className={cn(
                "min-w-0 max-w-full shrink-0 self-start sm:self-center",
                actionsClassName,
              )}
            >
              {actions}
            </div>
          )}
        </div>
        {children}
      </main>
    </PageContainer>
  );
  if (frame?.role === role) return content;

  return (
    <PortalTheme role={role}>
      <div
        data-portal-shell={role}
        className={`${theme.ambientShell} relative min-h-screen antialiased text-ink-900 selection:bg-brand-100 selection:text-brand-900`}
      >
        <div className={theme.donorGlassCanvas} aria-hidden="true">
          <span className={`${theme.donorOrb} ${theme.donorOrbEmerald}`} />
          <span className={`${theme.donorOrb} ${theme.donorOrbTeal}`} />
          <span className={`${theme.donorOrb} ${theme.donorOrbSky}`} />
          <span className={`${theme.donorOrb} ${theme.donorOrbGold}`} />
        </div>
        <DesktopSidebar
          role={role}
          activeHref={activeHref}
          profileName={profileName}
          profileDescription={profileDescription}
          avatarInitials={avatarInitials}
        />
        <div className="min-w-0 flex flex-col min-h-screen lg:pl-[var(--sidebar-width)]">
          <AppHeader
            role={role}
            activeHref={activeHref}
            profileName={profileName}
            profileDescription={profileDescription}
            avatarInitials={avatarInitials}
            notificationHref={notificationHref}
            unreadNotifications={unreadNotifications}
          />
          {content}
          {/* Native Mobile Bottom Navigation App Bar (auto-hidden in focused action flows) */}
          {!shouldHideMobileNav && (
            <MobileBottomNavigation
              role={role}
              activeHref={activeHref}
              unreadNotifications={unreadNotifications}
            />
          )}
        </div>
        <DemoRoleSwitcher />
      </div>
    </PortalTheme>
  );
}
