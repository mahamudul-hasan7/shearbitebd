import { HeartHandshake, Leaf } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";

export function BrandLogo({
  compact = false,
  className,
  href = ROUTES.auth.login,
  inverse = false,
}: {
  compact?: boolean;
  className?: string;
  href?: string;
  inverse?: boolean;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-3 transition-opacity hover:opacity-95", className)} aria-label="ShareBite BD home">
      <span className={cn(
        "relative grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-sm transition-transform duration-200 group-hover:scale-105",
        inverse ? "bg-white/15 ring-1 ring-white/30 backdrop-blur-md" : "bg-gradient-to-tr from-brand-700 via-brand-600 to-brand-500 shadow-brand-700/20 shadow-md"
      )}>
        <HeartHandshake className="size-5" aria-hidden="true" />
        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-gradient-to-br from-accent-400 to-accent-600 text-white ring-2 ring-white shadow-xs">
          <Leaf className="size-2.5" aria-hidden="true" />
        </span>
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="flex items-center gap-1">
            <span className={cn("text-lg font-black tracking-tight", inverse ? "text-white" : "text-ink-900")}>ShareBite</span>
            <span className="rounded-md bg-accent-100 px-1.5 py-0.5 text-xs font-black uppercase tracking-wider text-accent-600">BD</span>
          </span>
        </span>
      )}
    </Link>
  );
}
