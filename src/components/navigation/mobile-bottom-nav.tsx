import Link from "next/link";
import { getNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { PortalRole } from "@/types/navigation";

export function MobileBottomNavigation({ role, activeHref }: { role: PortalRole; activeHref: string }) {
  const items = getNavigation(role, activeHref.startsWith("/preview/"));
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 mx-auto grid max-w-xl grid-cols-5 border-t border-line bg-white/95 px-1 pt-1.5 text-ink-700 shadow-sticky backdrop-blur-lg lg:hidden" aria-label="Mobile navigation">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href === activeHref;
        if (item.isPrimary) {
          return (
            <Link key={item.label} href={item.href} aria-current={active ? "page" : undefined} className="flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-semibold text-brand-800 sm:text-xs">
              <span className="grid size-7 place-items-center rounded-lg bg-brand-100 text-brand-800">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        }
        return (
          <Link key={item.label} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-semibold sm:px-2 sm:text-xs", active ? "bg-brand-50 text-brand-800" : "text-muted-600")}>
            <Icon className="size-5" aria-hidden="true" />
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export const MobileBottomNav = MobileBottomNavigation;
