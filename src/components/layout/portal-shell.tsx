"use client";

import { useUiText } from "@/lib/i18n/use-ui-text";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { DesktopSidebar } from "@/components/navigation/desktop-sidebar";
import { MobileBottomNavigation } from "@/components/navigation/mobile-bottom-nav";
import { cn } from "@/lib/utils";
import type { PortalRole } from "@/types/navigation";
import { VolunteerDutyPanel } from "@/features/volunteer-dashboard/volunteer-duty-panel";

export function PortalShell({
  role,
  activeHref,
  title,
  description,
  actions,
  backHref,
  backLabel = "ফিরে যান",
  hideMobileNav = false,
  profileName,
  profileDescription,
  avatarInitials,
  notificationHref,
  unreadNotifications,
  compactHeader = false,
  showDutyPanel = true,
  titleClassName,
  children,
}: {
  role: PortalRole;
  activeHref: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  hideMobileNav?: boolean;
  profileName?: string;
  profileDescription?: string;
  avatarInitials?: string;
  notificationHref?: string;
  unreadNotifications?: number;
  compactHeader?: boolean;
  showDutyPanel?: boolean;
  titleClassName?: string;
  children: ReactNode;
}) {
  const tx = useUiText();
  const shouldHideMobileNav =
    hideMobileNav ||
    activeHref.endsWith("/new") ||
    activeHref.includes("/tracking") ||
    activeHref.includes("/confirm-delivery") ||
    activeHref.includes("/missions/");

  return (
    <div className="min-h-screen bg-canvas antialiased text-ink-900 selection:bg-brand-100 selection:text-brand-900">
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
        <PageContainer
          className={cn(
            "flex-1 pt-4 sm:pt-8",
            shouldHideMobileNav ? "pb-8 sm:pb-12" : "pb-[calc(7.5rem+env(safe-area-inset-bottom))] lg:pb-12",
          )}
        >
          <main className="min-w-0">
            {/* Dedicated Left-Aligned Back Navigation */}
            {backHref && (
              <div className="mb-4">
                <Link
                  href={backHref}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-900 transition-all group cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1 text-emerald-600" />
                  <span>{backLabel}</span>
                </Link>
              </div>
            )}

            <div className={cn(compactHeader ? "mb-5 flex flex-col gap-3 sm:mb-8" : "mb-8 flex flex-col gap-4", "sm:flex-row sm:items-center sm:justify-between")}>
              <div className="min-w-0 flex-1">
                <div className={cn("items-center gap-2", compactHeader ? "hidden sm:flex" : "flex")}>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-800 ring-1 ring-inset ring-emerald-700/10">
                    <span className="size-1.5 rounded-full bg-emerald-600" />
                    {role === "donor" ? tx("দাতা ওয়ার্কস্পেস · বাংলাদেশ") : role === "volunteer" ? tx("ভলান্টিয়ার স্কোয়াড · বাংলাদেশ") : tx("এনজিও ওয়ার্কস্পেস · বাংলাদেশ")}
                  </span>
                </div>
                <h1 className={cn("mt-2 text-2xl font-black tracking-tight text-ink-900 sm:text-3xl lg:text-4xl", titleClassName)}>
                  {title}
                </h1>
                {description && (
                  <p className={cn("mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-600", compactHeader && "hidden sm:block")}>
                    {description}
                  </p>
                )}
              </div>
              {actions && <div className="min-w-0 max-w-full shrink-0 self-start sm:self-center">{actions}</div>}
            </div>
            {showDutyPanel && role === "volunteer" && !activeHref.includes("/missions/") && <VolunteerDutyPanel />}
            {children}
          </main>
        </PageContainer>
        {/* Native Mobile Bottom Navigation App Bar (auto-hidden in focused action flows) */}
        {!shouldHideMobileNav && (
          <MobileBottomNavigation
            role={role}
            activeHref={activeHref}
            unreadNotifications={unreadNotifications}
          />
        )}
      </div>
    </div>
  );
}
