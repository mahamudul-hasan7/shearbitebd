import { HeartHandshake, Leaf } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";

export function BrandLogo({
  compact = false,
  className,
  href = ROUTES.home,
  inverse = false,
}: {
  compact?: boolean;
  className?: string;
  href?: string;
  inverse?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-3 transition-opacity hover:opacity-95 select-none", className)}
      aria-label="ShareBite BD home"
    >
      <span
        className={cn(
          "relative grid size-11 shrink-0 place-items-center rounded-2xl text-white shadow-md transition-transform duration-200 group-hover:scale-105",
          inverse
            ? "bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 ring-1 ring-emerald-400/40 shadow-lg shadow-emerald-950/50"
            : "bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 shadow-emerald-700/25 ring-1 ring-emerald-600/30"
        )}
      >
        <HeartHandshake className="size-6" aria-hidden="true" />
        <span className="absolute -right-1 -top-1 grid size-4.5 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 ring-2 ring-white shadow-xs">
          <Leaf className="size-2.5" aria-hidden="true" />
        </span>
      </span>

      {!compact && (
        <span className="flex items-center gap-1.5 select-none">
          <span
            className={cn(
              "text-2xl font-black tracking-tight font-heading leading-none",
              inverse ? "text-white" : "text-slate-900"
            )}
          >
            ShareBite
          </span>
          <span className="rounded-md bg-gradient-to-r from-amber-400 to-amber-500 px-1.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-2xs font-heading leading-none">
            BD
          </span>
        </span>
      )}
    </Link>
  );
}
