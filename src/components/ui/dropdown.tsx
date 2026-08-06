import { ChevronDown, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  description?: string;
}

export function Dropdown({ label, items, align = "left", className }: { label: string; items: DropdownItem[]; align?: "left" | "right"; className?: string }) {
  return (
    <details className={cn("group relative inline-block", className)}>
      <summary className="inline-flex h-12 cursor-pointer list-none items-center gap-2 rounded-control border border-brand-600 bg-white px-5 text-sm font-bold text-brand-700 transition hover:bg-brand-50 [&::-webkit-details-marker]:hidden">
        {label}
        <ChevronDown className="size-4 transition group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className={cn("absolute z-40 mt-2 min-w-64 rounded-2xl border border-line bg-white p-2 shadow-dialog", align === "right" ? "right-0" : "left-0")}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href} className="flex items-start gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-brand-50">
              {Icon && <Icon className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />}
              <span>
                <span className="block font-bold text-ink-900">{item.label}</span>
                {item.description && <span className="mt-0.5 block text-xs leading-5 text-muted-600">{item.description}</span>}
              </span>
            </Link>
          );
        })}
      </div>
    </details>
  );
}
