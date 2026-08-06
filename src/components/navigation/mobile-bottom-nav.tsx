import Link from "next/link";
import { getNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { PortalRole } from "@/types/navigation";

export function MobileBottomNav({ role, activeHref }: { role: PortalRole; activeHref: string }) {
  const items = getNavigation(role);
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-xl items-end justify-around rounded-t-[2rem] bg-brand-800 px-2 pt-2 text-white shadow-float lg:hidden" aria-label="Mobile navigation">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href === activeHref;
        if (item.isPrimary) {
          return (
            <Link key={item.label} href={item.href} className="-mt-7 flex min-w-16 flex-col items-center gap-1 text-xs font-bold">
              <span className="grid size-16 place-items-center rounded-full border-[6px] border-canvas bg-white text-brand-700 shadow-float">
                <Icon className="size-7" aria-hidden="true" />
              </span>
              <span className="text-white">{item.label}</span>
            </Link>
          );
        }
        return (
          <Link key={item.label} href={item.href} className={cn("flex min-w-16 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold", active ? "bg-white text-brand-800" : "text-white/80")}>
            <Icon className="size-5" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
