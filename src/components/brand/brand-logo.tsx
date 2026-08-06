import { HeartHandshake, Leaf } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";

export function BrandLogo({
  compact = false,
  className,
  href = ROUTES.auth.splash,
  inverse = false,
}: {
  compact?: boolean;
  className?: string;
  href?: string;
  inverse?: boolean;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-3", className)} aria-label="ShareBite BD home">
      <span className={cn("relative grid size-11 shrink-0 place-items-center rounded-2xl text-white shadow-card", inverse ? "bg-white/15 ring-1 ring-white/20" : "bg-brand-600")}>
        <HeartHandshake className="size-6" aria-hidden="true" />
        <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-accent-500 text-white ring-2 ring-white">
          <Leaf className="size-3" aria-hidden="true" />
        </span>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className={cn("text-xl font-extrabold tracking-tight", inverse ? "text-white" : "text-brand-800")}>ShareBite</span>{" "}
          <span className="text-xl font-extrabold tracking-tight text-accent-500">BD</span>
        </span>
      )}
    </Link>
  );
}
