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
    <div className="min-h-screen bg-canvas antialiased text-ink-900 selection:bg-brand-100 selection:text-brand-900">
      <DesktopSidebar role={role} activeHref={activeHref} profileName={profileName} profileDescription={profileDescription} avatarInitials={avatarInitials} />
      <div className="min-w-0 flex flex-col min-h-screen lg:pl-[var(--sidebar-width)]">
        <AppHeader role={role} profileName={profileName} profileDescription={profileDescription} avatarInitials={avatarInitials} notificationHref={notificationHref} unreadNotifications={unreadNotifications} />
        <PageContainer className="flex-1 pb-32 pt-6 sm:pt-8 lg:pb-12">
          <main className="min-w-0">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-brand-700 ring-1 ring-inset ring-brand-600/10">
                    {role === "donor" ? "Donor Workspace" : "NGO Workspace"}
                  </span>
                </div>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
                  {title}
                </h1>
                {description && (
                  <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-600">
                    {description}
                  </p>
                )}
              </div>
              {actions && <div className="shrink-0 self-start sm:self-center">{actions}</div>}
            </div>
            {children}
          </main>
        </PageContainer>
      </div>
      <MobileBottomNavigation role={role} activeHref={activeHref} />
    </div>
  );
}
