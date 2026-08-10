import { Bell } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Avatar } from "@/components/ui/avatar";
import { IconButton, IconButtonLink } from "@/components/ui/icon-button";
import type { PortalRole } from "@/types/navigation";

export function AppHeader({
  role,
  eyebrow = "ShareBite BD Portal",
  description = "Responsive frontend foundation",
  profileName,
  profileDescription,
  avatarInitials,
  notificationHref,
  unreadNotifications = 0,
}: {
  role: PortalRole;
  eyebrow?: string;
  description?: string;
  profileName?: string;
  profileDescription?: string;
  avatarInitials?: string;
  notificationHref?: string;
  unreadNotifications?: number;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-[var(--page-max-width)] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="lg:hidden"><BrandLogo compact /></div>
        <div className="hidden lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">{eyebrow}</p>
          <p className="mt-1 text-sm text-muted-600">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative">
            {notificationHref ? (
              <IconButtonLink href={notificationHref} label={`${unreadNotifications} unread notification${unreadNotifications === 1 ? "" : "s"}`}><Bell className="size-5" /></IconButtonLink>
            ) : (
              <IconButton label="Notifications preview" disabled><Bell className="size-5" /></IconButton>
            )}
            {unreadNotifications > 0 && <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-accent-500 text-[9px] font-black text-white ring-2 ring-canvas" aria-hidden="true">{Math.min(unreadNotifications, 9)}</span>}
          </span>
          {profileName && (
            <div className="hidden max-w-44 text-right sm:block">
              <p className="truncate text-sm font-black text-ink-900">{profileName}</p>
              {profileDescription && <p className="truncate text-xs text-muted-600">{profileDescription}</p>}
            </div>
          )}
          <Avatar initials={avatarInitials ?? (role === "donor" ? "FD" : "NG")} size="sm" />
        </div>
      </div>
    </header>
  );
}
