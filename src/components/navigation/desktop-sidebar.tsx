import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Avatar } from "@/components/ui/avatar";
import { getNavigation, roleMeta } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { PortalRole } from "@/types/navigation";

export function DesktopSidebar({ role, activeHref, profileName, profileDescription, avatarInitials }: { role: PortalRole; activeHref: string; profileName?: string; profileDescription?: string; avatarInitials?: string }) {
  const items = getNavigation(role, activeHref.startsWith("/preview/"));
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[var(--sidebar-width)] flex-col border-r border-line bg-surface/95 backdrop-blur-md px-4 py-5 shadow-xs lg:flex">
      <div className="px-2">
        <BrandLogo />
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1.5" aria-label={`${roleMeta[role].label} navigation`}>
        <div className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-400">
          Navigation
        </div>
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === activeHref;
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150",
                active
                  ? "bg-brand-50 text-brand-700 shadow-xs"
                  : "text-muted-600 hover:bg-slate-100/70 hover:text-ink-900",
              )}
            >
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-brand-600" aria-hidden="true" />
              )}
              <Icon
                className={cn(
                  "size-5 transition-transform duration-150 group-hover:scale-110",
                  active ? "text-brand-600" : "text-muted-400 group-hover:text-muted-600"
                )}
                aria-hidden="true"
              />
              <span className="flex-1">{item.label}</span>
              {item.isPrimary && (
                <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-600">
                  Quick
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-line">
        <div className="rounded-xl border border-line bg-canvas/70 p-3 shadow-xs">
          <div className="flex items-center gap-3">
            <Avatar initials={avatarInitials ?? (role === "donor" ? "FD" : "NG")} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-ink-900">{profileName ?? roleMeta[role].label}</p>
              <p className="truncate text-[11px] text-muted-400">{profileDescription ?? roleMeta[role].description}</p>
            </div>
            <span className="size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" title="Online" />
          </div>
        </div>
      </div>
    </aside>
  );
}
