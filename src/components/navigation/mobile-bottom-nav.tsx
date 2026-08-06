import Link from "next/link";
import { getNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { PortalRole } from "@/types/navigation";

export function MobileBottomNavigation({ role, activeHref }: { role: PortalRole; activeHref: string }) {
  const items = getNavigation(role, activeHref.startsWith("/preview/"));
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 mx-auto grid max-w-xl grid-cols-5 items-end rounded-t-[2rem] bg-brand-800 px-1 pt-2 text-white shadow-float lg:hidden" aria-label="Mobile navigation">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href === activeHref;
        if (item.isPrimary) {
          return (
            <Link key={item.label} href={item.href} aria-current={active ? "page" : undefined} className="-mt-6 flex min-w-0 flex-col items-center gap-1 text-[11px] font-bold sm:text-xs">
              <span className="grid size-14 place-items-center rounded-full border-[5px] border-canvas bg-white text-brand-700 shadow-float sm:size-16 sm:border-[6px]">
                <Icon className="size-6 sm:size-7" aria-hidden="true" />
              </span>
              <span className="max-w-full truncate text-white">{item.label}</span>
            </Link>
          );
        }
        return (
          <Link key={item.label} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-semibold sm:px-2 sm:text-xs", active ? "bg-white text-brand-800" : "text-white/80")}>
            <Icon className="size-5" aria-hidden="true" />
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export const MobileBottomNav = MobileBottomNavigation;
