import Link from "next/link";
import { cn } from "@/lib/utils";

export function Tabs({ items, label = "Section navigation" }: { items: Array<{ label: string; href: string; active?: boolean; count?: number }>; label?: string }) {
  return (
    <nav aria-label={label} className="flex gap-2 overflow-x-auto rounded-2xl border border-line bg-white p-1.5 shadow-sm">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "inline-flex min-w-max items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition",
            item.active ? "bg-brand-600 text-white" : "text-muted-600 hover:bg-brand-50 hover:text-brand-800",
          )}
        >
          {item.label}
          {typeof item.count === "number" && (
            <span className={cn("rounded-full px-2 py-0.5 text-xs", item.active ? "bg-white/20" : "bg-brand-100 text-brand-800")}>{item.count}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}
