import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Avatar } from "@/components/ui/avatar";
import { getNavigation, roleMeta } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { PortalRole } from "@/types/navigation";

export function DesktopSidebar({ role, activeHref, profileName, profileDescription, avatarInitials }: { role: PortalRole; activeHref: string; profileName?: string; profileDescription?: string; avatarInitials?: string }) {
  const items = getNavigation(role, activeHref.startsWith("/preview/"));
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[var(--sidebar-width)] flex-col border-r border-line bg-white px-4 py-5 lg:flex">
      <BrandLogo />
      <div className="mt-7 rounded-card border border-line bg-canvas p-3.5">
        <div className="flex items-center gap-3">
          <Avatar initials={avatarInitials ?? (role === "donor" ? "FD" : "NG")} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink-900">{profileName ?? roleMeta[role].label}</p>
            <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-600">{profileDescription ?? roleMeta[role].description}</p>
          </div>
        </div>
      </div>
      <nav className="mt-5 grid gap-1" aria-label={`${roleMeta[role].label} navigation`}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === activeHref;
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-semibold transition-colors",
                active ? "bg-brand-100 text-brand-900" : "text-muted-600 hover:bg-canvas hover:text-ink-900",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span>{item.label}</span>
              {item.isPrimary && <span className="ml-auto rounded-md bg-accent-100 px-2 py-0.5 text-[10px] text-accent-600">Primary</span>}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-line px-2 pt-5">
        <p className="text-sm font-bold text-ink-900">Rescue Food. Respect Time.</p>
        <p className="mt-1 text-xs leading-5 text-muted-600">A focused workspace for everyday rescue operations.</p>
      </div>
    </aside>
  );
}
