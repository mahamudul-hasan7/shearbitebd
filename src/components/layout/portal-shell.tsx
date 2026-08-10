import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { DesktopSidebar } from "@/components/navigation/desktop-sidebar";
import { MobileBottomNavigation } from "@/components/navigation/mobile-bottom-nav";
import type { PortalRole } from "@/types/navigation";

export function PortalShell({
  role,
  activeHref,
  title,
  description,
  actions,
  profileName,
  profileDescription,
  avatarInitials,
  notificationHref,
  unreadNotifications,
  children,
}: {
  role: PortalRole;
  activeHref: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  profileName?: string;
  profileDescription?: string;
  avatarInitials?: string;
  notificationHref?: string;
  unreadNotifications?: number;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas">
      <DesktopSidebar role={role} activeHref={activeHref} profileName={profileName} profileDescription={profileDescription} avatarInitials={avatarInitials} />
      <div className="lg:pl-[var(--sidebar-width)]">
        <AppHeader role={role} profileName={profileName} profileDescription={profileDescription} avatarInitials={avatarInitials} notificationHref={notificationHref} unreadNotifications={unreadNotifications} />
        <PageContainer className="pb-32 pt-6 lg:pb-10">
          <main>
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-brand-600">{role === "donor" ? "Donor Portal" : "NGO Portal"}</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">{title}</h1>
                {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-600 sm:text-base">{description}</p>}
              </div>
              {actions}
            </div>
            {children}
          </main>
        </PageContainer>
      </div>
      <MobileBottomNavigation role={role} activeHref={activeHref} />
    </div>
  );
}
