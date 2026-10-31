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
    <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 min-w-0 max-w-[var(--page-max-width)] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 lg:hidden">
          <BrandLogo compact />
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
            {role === "donor" ? "Donor" : "NGO"}
          </span>
        </div>

        <div className="hidden lg:block">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-brand-500" />
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">{eyebrow}</p>
          </div>
          <p className="mt-0.5 text-xs text-muted-600 font-medium">{description}</p>
        </div>

        <div className="flex min-w-0 items-center gap-3">
          <span className="relative">
            {notificationHref ? (
              <IconButtonLink
                href={notificationHref}
                label={`${unreadNotifications} unread notification${unreadNotifications === 1 ? "" : "s"}`}
              >
                <Bell className="size-4.5 text-muted-600 transition-colors group-hover:text-ink-900" />
              </IconButtonLink>
            ) : (
              <IconButton label="Notifications preview" disabled>
                <Bell className="size-4.5 text-muted-400" />
              </IconButton>
            )}
            {unreadNotifications > 0 && (
              <span
                className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-accent-500 text-[10px] font-black text-white ring-2 ring-surface shadow-xs animate-pulse"
                aria-hidden="true"
              >
                {Math.min(unreadNotifications, 9)}
              </span>
            )}
          </span>

          {profileName && (
            <div className="hidden min-w-0 max-w-48 text-right sm:block">
              <p className="truncate text-xs font-bold text-ink-900">{profileName}</p>
              {profileDescription && (
                <p className="truncate text-[11px] text-muted-400 font-medium">{profileDescription}</p>
              )}
            </div>
          )}

          <div className="ring-2 ring-brand-100 rounded-full">
            <Avatar initials={avatarInitials ?? (role === "donor" ? "FD" : "NG")} size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
}
