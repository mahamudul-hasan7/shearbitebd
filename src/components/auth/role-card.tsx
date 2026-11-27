"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Bike,
  Building2,
  LockKeyhole,
  UserRoundCog,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const DEFAULT_ICONS: Record<"donor" | "ngo" | "volunteer" | "admin", LucideIcon> = {
  donor: UtensilsCrossed,
  ngo: Building2,
  volunteer: Bike,
  admin: UserRoundCog,
};

export interface RoleCardProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  description: string;
  href: string;
  badge?: string;
  tone?: "donor" | "ngo" | "volunteer" | "admin";
  disabled?: boolean;
}

export function RoleCard({
  icon: customIcon,
  title,
  subtitle,
  description,
  href,
  badge,
  tone = "donor",
  disabled = false,
}: RoleCardProps) {
  const tx = useUiText();
  const Icon = customIcon ?? DEFAULT_ICONS[tone];

  const toneConfig = {
    donor: {
      cardHover: "hover:border-emerald-400/90 hover:shadow-xl hover:shadow-emerald-950/10",
      iconStyle: "bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-600/20 group-hover:bg-gradient-to-br group-hover:from-[#022c22] group-hover:to-[#059669] group-hover:text-white",
      arrowStyle: "border-emerald-200/80 bg-white/80 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white group-hover:border-emerald-700",
      linkText: "text-emerald-800",
    },
    ngo: {
      cardHover: "hover:border-emerald-400/90 hover:shadow-xl hover:shadow-emerald-950/10",
      iconStyle: "bg-teal-500/15 text-teal-800 ring-1 ring-teal-600/20 group-hover:bg-gradient-to-br group-hover:from-[#022c22] group-hover:to-[#0d9488] group-hover:text-white",
      arrowStyle: "border-emerald-200/80 bg-white/80 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white group-hover:border-emerald-700",
      linkText: "text-emerald-800",
    },
    volunteer: {
      cardHover: "hover:border-emerald-400/90 hover:shadow-xl hover:shadow-emerald-950/10",
      iconStyle: "bg-emerald-600/12 text-emerald-900 ring-1 ring-emerald-700/20 group-hover:bg-gradient-to-br group-hover:from-[#064e3b] group-hover:to-[#10b981] group-hover:text-white",
      arrowStyle: "border-emerald-200/80 bg-white/80 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white group-hover:border-emerald-700",
      linkText: "text-emerald-800",
    },
    admin: {
      cardHover: "opacity-60",
      iconStyle: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
      arrowStyle: "bg-slate-100 text-slate-400 border-slate-200",
      linkText: "text-slate-500",
    },
  };

  const current = toneConfig[tone];

  const content = (
    <div
      className={cn(
        "liquid-glass-tile group relative flex h-full flex-col justify-between rounded-2xl border border-white/85 bg-gradient-to-br from-white/80 via-white/52 to-emerald-50/58 p-4 sm:p-5 transition-all duration-200 shadow-[inset_0_1.5px_1px_rgb(255_255_255_/_95%),0_14px_32px_-16px_rgb(2_44_34_/_16%)] select-none",
        current.cardHover,
        disabled
          ? "cursor-not-allowed bg-slate-50/50"
          : "cursor-pointer hover:-translate-y-1 active:translate-y-0 active:scale-[0.99]",
      )}
    >
      <div>
        {/* Top Icon & Badge Row */}
        <div className="flex items-center justify-between gap-3">
          <div
            className={cn(
              "grid size-10 sm:size-11 place-items-center rounded-xl transition-all duration-300 shadow-2xs",
              current.iconStyle,
            )}
          >
            <Icon className="size-5 transition-transform duration-300 group-hover:scale-110" />
          </div>

          {badge && (
            <span className="rounded-full bg-white/75 px-2.5 py-0.5 text-[10px] font-bold text-emerald-900 border border-emerald-200/80">
              {badge}
            </span>
          )}
        </div>

        {/* Title & Short Subtitle */}
        <div className="mt-3 sm:mt-4">
          <h3 className="text-base font-black text-slate-900 font-heading">
            {title}
            {subtitle && (
              <span className="ml-1.5 text-xs font-medium text-slate-500 font-sans">
                ({subtitle})
              </span>
            )}
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600 font-normal">
            {tx(description)}
          </p>
        </div>
      </div>

      {/* Bottom Minimal Action Link */}
      <div className="mt-3.5 flex items-center justify-between border-t border-emerald-900/10 pt-2.5 sm:mt-4 sm:pt-3">
        <span
          className={cn(
            "text-xs font-bold font-heading transition-colors",
            disabled ? "text-slate-400" : current.linkText,
          )}
        >
          {disabled ? tx("সংরক্ষিত পোর্টাল") : tx("Create an account")}
        </span>

        <div
          className={cn(
            "grid size-7 place-items-center rounded-lg border border-slate-200 text-slate-400 transition-all duration-200",
            disabled ? "" : current.arrowStyle,
          )}
        >
          {disabled ? (
            <LockKeyhole className="size-3.5" />
          ) : (
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          )}
        </div>
      </div>
    </div>
  );

  if (disabled) {
    return content;
  }

  return (
    <Link
      href={href}
      className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-2xl"
    >
      {content}
    </Link>
  );
}
