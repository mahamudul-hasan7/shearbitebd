import { UiText } from "@/lib/i18n/ui-text-node";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Tabs({
  items,
  label = "Section navigation",
}: {
  items: Array<{
    label: string;
    href: string;
    active?: boolean;
    count?: number;
  }>;
  label?: string;
}) {
  return (
    <nav
      aria-label={label}
      className="flex max-w-full gap-1 overflow-x-auto overscroll-x-contain border-b border-line bg-transparent pb-px [scrollbar-width:thin]"
    >
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "inline-flex min-h-11 min-w-max shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors",
            item.active
              ? "border-[var(--role-accent,var(--brand-700))] text-[var(--role-ink,var(--brand-800))]"
              : "border-transparent text-muted-600 hover:border-[var(--role-border,var(--brand-200))] hover:text-ink-900",
          )}
        >
          <UiText source={item.label} />
          {typeof item.count === "number" && (
            <span className="rounded-md bg-[var(--role-soft,var(--brand-100))] px-1.5 py-0.5 text-xs text-[var(--role-ink,var(--brand-800))]">
              {item.count}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
