"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { usePathname } from "next/navigation";
import { useMockAuth } from "@/features/auth/mock-auth";
import { AppHeader } from "./app-header";
import { DesktopSidebar } from "@/components/navigation/desktop-sidebar";
import { MobileBottomNavigation } from "@/components/navigation/mobile-bottom-nav";
import { PortalTheme } from "@/components/portal/portal-theme";
import theme from "@/components/portal/portal-theme.module.css";
import { DemoRoleSwitcher } from "@/components/portal/demo-role-switcher";
import { ROUTES } from "@/lib/routes";
import type { PortalRole } from "@/types/navigation";

export type PortalPageChrome = {
  pathname: string;
  activeHref: string;
  hideMobileNav?: boolean;
  profileName?: string;
  profileDescription?: string;
  avatarInitials?: string;
  notificationHref?: string;
};
export const PortalFrameContext = createContext<{
  role: PortalRole;
  updatePage: (page: PortalPageChrome) => void;
  previousPath: RefObject<string | null>;
} | null>(null);

export function focusedPortalPath(pathname: string) {
  return (
    /\/(new|edit|tracking|confirm-delivery|distribution)\/?$/.test(pathname) ||
    pathname.includes("/missions/")
  );
}

export function PortalFrame({
  role,
  children,
}: {
  role: PortalRole;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { session } = useMockAuth();
  const previousPath = useRef<string | null>(null);
  const [page, setPage] = useState<PortalPageChrome>();
  const updatePage = useCallback(
    (next: PortalPageChrome) =>
      setPage((current) =>
        JSON.stringify(current) === JSON.stringify(next) ? current : next,
      ),
    [],
  );
  const value = useMemo(
    () => ({ role, updatePage, previousPath }),
    [role, updatePage],
  );
  const current = page?.pathname === pathname ? page : undefined;
  const activeHref = current?.activeHref || pathname;
  const profile = {
    profileName: session?.displayName || current?.profileName,
    profileDescription: current?.profileDescription,
    avatarInitials: current?.avatarInitials,
  };
  return (
    <PortalTheme role={role}>
      <div
        data-portal-shell={role}
        className={`${theme.ambientShell} min-h-screen antialiased text-ink-900 selection:bg-brand-100 selection:text-brand-900`}
      >
        <DesktopSidebar role={role} activeHref={activeHref} {...profile} />
        <div className="min-w-0 flex min-h-screen flex-col lg:pl-[var(--sidebar-width)]">
          <AppHeader
            role={role}
            activeHref={activeHref}
            {...profile}
            notificationHref={
              current?.notificationHref || ROUTES[role].notifications
            }
          />
          <PortalFrameContext.Provider value={value}>
            {children}
          </PortalFrameContext.Provider>
          {!focusedPortalPath(pathname) && !current?.hideMobileNav && (
            <MobileBottomNavigation role={role} activeHref={activeHref} />
          )}
        </div>
        <DemoRoleSwitcher />
      </div>
    </PortalTheme>
  );
}
