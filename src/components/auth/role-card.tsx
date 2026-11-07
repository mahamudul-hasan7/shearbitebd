"use client";

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
  const Icon = customIcon ?? DEFAULT_ICONS[tone];

  const toneConfig = {
    donor: {
      cardHover: "hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-900/5",
      iconStyle: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15 group-hover:bg-emerald-600 group-hover:text-white",
      arrowStyle: "group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600",
      linkText: "text-emerald-700",
    },
    ngo: {
      cardHover: "hover:border-blue-400 hover:shadow-lg hover:shadow-blue-900/5",
      iconStyle: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/15 group-hover:bg-blue-600 group-hover:text-white",
      arrowStyle: "group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600",
      linkText: "text-blue-700",
    },
    volunteer: {
      cardHover: "hover:border-amber-400 hover:shadow-lg hover:shadow-amber-900/5",
      iconStyle: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/15 group-hover:bg-amber-500 group-hover:text-white",
      arrowStyle: "group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500",
      linkText: "text-amber-700",
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
        "group relative flex h-full flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 transition-all duration-200 shadow-2xs select-none",
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
              "grid size-12 place-items-center rounded-xl transition-all duration-300 shadow-2xs",
              current.iconStyle,
            )}
          >
            <Icon className="size-5.5 transition-transform duration-300 group-hover:scale-110" />
          </div>

          {badge && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200/80">
              {badge}
            </span>
          )}
        </div>

        {/* Title & Short Subtitle */}
        <div className="mt-4">
          <h3 className="text-base font-black text-slate-900 font-heading">
            {title}
            {subtitle && (
              <span className="ml-1.5 text-xs font-medium text-slate-400 font-sans">
                ({subtitle})
              </span>
            )}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 font-normal">
            {description}
          </p>
        </div>
      </div>

      {/* Bottom Minimal Action Link */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5">
        <span
          className={cn(
            "text-xs font-bold font-heading transition-colors",
            disabled ? "text-slate-400" : current.linkText,
          )}
        >
          {disabled ? "সংরক্ষিত পোর্টাল" : "রেজিস্ট্রেশন করুন"}
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
