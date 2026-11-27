"use client";

import type { MouseEventHandler } from "react";
import { UiText } from "@/lib/i18n/ui-text-node";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { HeartHandshake, Leaf } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";

export function BrandLogo({
  compact = false,
  className,
  href = ROUTES.home,
  inverse = false,
  variant = "glass",
  onClick,
}: {
  compact?: boolean;
  className?: string;
  href?: string;
  inverse?: boolean;
  variant?: "glass" | "classic";
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  const tx = useUiText();
  const isClassic = variant === "classic";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group inline-flex shrink-0 select-none items-center transition-opacity hover:opacity-95",
        isClassic ? "gap-2 sm:gap-3" : "gap-2.5 sm:gap-3",
        className,
      )}
      aria-label={tx("ShareBite BD home")}
    >
      <span
        className={cn(
          "relative grid shrink-0 place-items-center transition-transform duration-200",
          isClassic
            ? cn(
                "size-9 min-[375px]:size-9.5 sm:size-11 rounded-xl sm:rounded-2xl text-white shadow-md group-hover:scale-105",
                inverse
                  ? "bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 ring-1 ring-emerald-400/40 shadow-lg shadow-emerald-950/50"
                  : "bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 shadow-emerald-700/25 ring-1 ring-emerald-600/30",
              )
            : cn(
                "size-9 min-[375px]:size-10 sm:size-11 rounded-[13px] sm:rounded-[14px] backdrop-blur-md group-hover:scale-[1.03]",
                inverse
                  ? "border border-white/25 bg-white/10 text-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_8px_18px_-12px_rgba(2,44,34,0.45)]"
                  : "border border-emerald-700/20 bg-emerald-500/10 text-emerald-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_8px_18px_-12px_rgba(6,78,59,0.25)]",
              ),
        )}
      >
        <HeartHandshake
          className={isClassic ? "size-5 sm:size-6" : "size-5 sm:size-[23px]"}
          strokeWidth={isClassic ? 2 : 1.85}
          aria-hidden="true"
        />
        {isClassic && (
          <span className="absolute -right-1 -top-1 grid size-4 sm:size-4.5 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 ring-2 ring-white shadow-xs">
            <Leaf className="size-2 sm:size-2.5" aria-hidden="true" />
          </span>
        )}
      </span>

      {!compact && (
        <span
          className={cn(
            "select-none",
            isClassic ? "flex items-center gap-1 sm:gap-1.5" : "inline-flex items-start",
          )}
        >
          <span
            className={cn(
              "font-heading",
              isClassic
                ? cn(
                    "text-lg font-black leading-none tracking-tight sm:text-2xl",
                    inverse ? "text-white" : "text-slate-900",
                  )
                : cn(
                    "text-[21px] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[24px]",
                    inverse ? "text-white" : "text-[#022c22]",
                  ),
            )}
          >
            {tx("ShareBite")}
          </span>
          <span
            className={cn(
              "font-heading leading-none",
              isClassic
                ? "rounded-md bg-gradient-to-r from-amber-400 to-amber-500 px-1 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-2xs sm:px-1.5 sm:text-[11px]"
                : cn(
                    "ml-[3px] -mt-[1px] text-[11px] font-semibold tracking-normal sm:text-xs",
                    inverse ? "text-emerald-300" : "text-emerald-700",
                  ),
            )}
          >
            <UiText source={"BD"} />
          </span>
        </span>
      )}
    </Link>
  );
}
