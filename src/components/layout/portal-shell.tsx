import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
  backHref,
  backLabel = "ফিরে যান",
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
  backHref?: string;
  backLabel?: string;
  profileName?: string;
  profileDescription?: string;
  avatarInitials?: string;
  notificationHref?: string;
  unreadNotifications?: number;
  children: ReactNode;
}) {
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
        <PageContainer className="flex-1 pb-24 sm:pb-28 lg:pb-12 pt-6 sm:pt-8">
          <main className="min-w-0">
            {/* Dedicated Left-Aligned Back Navigation */}
            {backHref && (
              <div className="mb-4">
                <Link
                  href={backHref}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-900 transition-all group cursor-pointer"
                >
                  <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1 text-emerald-600" />
                  <span>{backLabel}</span>
                </Link>
              </div>
            )}

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-800 ring-1 ring-inset ring-emerald-700/10">
                    <span className="size-1.5 rounded-full bg-emerald-600" />
                    {role === "donor"
                      ? "দাতা ওয়ার্কস্পেস · বাংলাদেশ"
                      : role === "volunteer"
                      ? "ভলান্টিয়ার স্কোয়াড · বাংলাদেশ"
                      : "এনজিও ওয়ার্কস্পেস · বাংলাদেশ"}
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
        {/* Native Mobile Bottom Navigation App Bar */}
        <MobileBottomNavigation
          role={role}
          activeHref={activeHref}
          unreadNotifications={unreadNotifications}
        />
      </div>
    </div>
  );
}
