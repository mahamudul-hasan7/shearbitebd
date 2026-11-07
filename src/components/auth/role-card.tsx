"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface RoleCardProps {
  icon: LucideIcon;
  title: string;
  englishSubtitle: string;
  badge?: string;
  liveStatus?: string;
  description: string;
  features: readonly string[];
  ctaText: string;
  href: string;
  tone?: "donor" | "ngo" | "volunteer" | "admin";
  disabled?: boolean;
}

export function RoleCard({
  icon: Icon,
  title,
  englishSubtitle,
  badge,
  liveStatus,
  description,
  features,
  ctaText,
  href,
  tone = "donor",
  disabled = false,
}: RoleCardProps) {
  const toneStyles = {
    donor: {
      card: "border-emerald-200/90 bg-gradient-to-b from-emerald-50/50 via-white to-white hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-900/10",
      iconBox: "bg-emerald-600 text-white shadow-md shadow-emerald-600/25",
      badge: "border-emerald-300 bg-emerald-100/80 text-emerald-800",
      featureTag: "bg-emerald-50/80 text-emerald-900 border-emerald-200/80",
      cta: "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-md shadow-emerald-700/20 group-hover:shadow-lg group-hover:shadow-emerald-700/30",
    },
    ngo: {
      card: "border-blue-200/90 bg-gradient-to-b from-blue-50/50 via-white to-white hover:border-blue-500 hover:shadow-xl hover:shadow-blue-900/10",
      iconBox: "bg-blue-600 text-white shadow-md shadow-blue-600/25",
      badge: "border-blue-300 bg-blue-100/80 text-blue-800",
      featureTag: "bg-blue-50/80 text-blue-900 border-blue-200/80",
      cta: "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white shadow-md shadow-blue-700/20 group-hover:shadow-lg group-hover:shadow-blue-700/30",
    },
    volunteer: {
      card: "border-amber-200/90 bg-gradient-to-b from-amber-50/50 via-white to-white hover:border-amber-500 hover:shadow-xl hover:shadow-amber-900/10",
      iconBox: "bg-amber-500 text-white shadow-md shadow-amber-500/25",
      badge: "border-amber-300 bg-amber-100/80 text-amber-900",
      featureTag: "bg-amber-50/80 text-amber-950 border-amber-200/80",
      cta: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-md shadow-amber-600/20 group-hover:shadow-lg group-hover:shadow-amber-600/30",
    },
    admin: {
      card: "border-slate-200 bg-gradient-to-b from-slate-50 via-white to-slate-50 opacity-75",
      iconBox: "bg-slate-700 text-white shadow-sm",
      badge: "border-slate-300 bg-slate-100 text-slate-700",
      featureTag: "bg-slate-100 text-slate-600 border-slate-200",
      cta: "bg-slate-200 text-slate-500 cursor-not-allowed",
    },
  };

  const currentTone = toneStyles[tone];

  const cardContent = (
    <div
      className={cn(
        "group relative flex h-full flex-col justify-between rounded-3xl border-2 p-6 transition-all duration-300 shadow-xs",
        currentTone.card,
        disabled
          ? "cursor-not-allowed select-none"
          : "cursor-pointer hover:-translate-y-1.5 active:translate-y-0 active:scale-[0.99]",
      )}
    >
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-3">
          {/* Icon Container */}
          <div
            className={cn(
              "grid size-13 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110",
              currentTone.iconBox,
            )}
          >
            <Icon className="size-6.5 transition-transform duration-300 group-hover:rotate-6" />
          </div>

          {/* Badges / Live Status */}
          <div className="flex flex-col items-end gap-1.5">
            {badge && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase font-heading shadow-2xs",
                  currentTone.badge,
                )}
              >
                <Sparkles className="size-3" />
                {badge}
              </span>
            )}
            {liveStatus && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/90 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200/80">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {liveStatus}
              </span>
            )}
          </div>
        </div>

        {/* Title and English subtitle */}
        <div className="mt-4">
          <h3 className="text-xl font-black tracking-tight text-slate-900 font-heading">
            {title}
          </h3>
          <p className="text-xs font-semibold text-slate-500 font-sans tracking-wide">
            {englishSubtitle}
          </p>
        </div>

        {/* Description */}
        <p className="mt-2.5 text-xs leading-relaxed text-slate-600 font-normal">
          {description}
        </p>

        {/* Key Features Chips */}
        <div className="mt-4 space-y-1.5">
          {features.map((feature) => (
            <div
              key={feature}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-[11px] font-medium leading-snug transition-colors",
                currentTone.featureTag,
              )}
            >
              <CheckCircle2 className="size-3.5 shrink-0 opacity-80" />
              <span className="truncate">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Button */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div
          className={cn(
            "flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 select-none font-heading",
            currentTone.cta,
          )}
        >
          <span>{ctaText}</span>
          {disabled ? (
            <LockKeyhole className="size-4 shrink-0" />
          ) : (
            <ArrowRight className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
          )}
        </div>
      </div>
    </div>
  );

  if (disabled) {
    return cardContent;
  }

  return (
    <Link href={href} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-3xl">
      {cardContent}
    </Link>
  );
}
