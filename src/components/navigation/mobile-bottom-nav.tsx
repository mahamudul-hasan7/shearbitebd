import Link from "next/link";
import { getNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { PortalRole } from "@/types/navigation";

export function MobileBottomNavigation({ role, activeHref }: { role: PortalRole; activeHref: string }) {
  const items = getNavigation(role, activeHref.startsWith("/preview/"));
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full border-t border-line bg-surface/95 backdrop-blur-xl shadow-sticky lg:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === activeHref;

          if (item.isPrimary) {
            return (
              <div key={item.label} className="relative -top-4 flex flex-col items-center">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/30 ring-4 ring-surface transition-transform duration-150 active:scale-95"
                  aria-label={item.label}
                >
                  <Icon className="size-6" aria-hidden="true" />
                </Link>
                <span className="mt-1 text-[10px] font-bold tracking-tight text-brand-700">
                  {item.label}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 text-center transition-colors",
                active
                  ? "text-brand-700 font-bold"
                  : "text-muted-600 hover:text-ink-900 font-medium",
              )}
            >
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-xl transition-all",
                  active ? "bg-brand-50 text-brand-700 scale-105" : "text-muted-400",
                )}
              >
                <Icon className="size-4.5" aria-hidden="true" />
              </div>
              <span className="text-[10px] leading-none tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export const MobileBottomNav = MobileBottomNavigation;
