import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Avatar } from "@/components/ui/avatar";
import { getNavigation, roleMeta } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { PortalRole } from "@/types/navigation";

export function DesktopSidebar({ role, activeHref }: { role: PortalRole; activeHref: string }) {
  const items = getNavigation(role, activeHref.startsWith("/preview/"));
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[var(--sidebar-width)] flex-col border-r border-line bg-white/95 px-5 py-6 backdrop-blur lg:flex">
      <BrandLogo />
      <div className="mt-8 rounded-3xl bg-brand-50 p-4">
        <div className="flex items-center gap-3">
          <Avatar initials={role === "donor" ? "FD" : "NG"} />
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-brand-900">{roleMeta[role].label}</p>
            <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-600">{roleMeta[role].description}</p>
          </div>
        </div>
      </div>
      <nav className="mt-6 grid gap-2" aria-label={`${roleMeta[role].label} navigation`}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === activeHref;
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition",
                active ? "bg-brand-600 text-white shadow-sm" : "text-muted-600 hover:bg-brand-50 hover:text-brand-800",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span>{item.label}</span>
              {item.isPrimary && <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[10px]", active ? "bg-white/20" : "bg-accent-100 text-accent-600")}>Primary</span>}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-5 text-white">
        <p className="text-sm font-extrabold">Rescue Food. Respect Time.</p>
        <p className="mt-2 text-xs leading-5 text-white/75">One responsive codebase for mobile and desktop.</p>
      </div>
    </aside>
  );
}
