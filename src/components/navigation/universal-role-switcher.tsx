"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { PortalRole } from "@/types/navigation";

export function UniversalRoleSwitcher({ currentRole }: { currentRole?: PortalRole | "home" }) {
  const pathname = usePathname() || "";

  const activeRole: PortalRole | "home" =
    currentRole ??
    (pathname.startsWith("/donor")
      ? "donor"
      : pathname.startsWith("/ngo")
      ? "ngo"
      : pathname.startsWith("/volunteer")
      ? "volunteer"
      : "home");

  return (
    <aside
      aria-label="ইউনিভার্সাল ডেমো রোল কন্ট্রোল বার"
      className="relative z-40 border-b border-emerald-900/50 bg-gradient-to-r from-[#011e16] via-[#022f23] to-[#011e16] px-3.5 py-1.5 text-white shadow-sm"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Left: Live status with pulsing green dot */}
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-80" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="font-bold text-emerald-300 tracking-wide">
            ঢাকা মেট্রো লাইভ রেসকিউ সক্রিয়
          </span>
          <span className="hidden md:inline text-white/30">|</span>
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-100/70">
            <Sparkles className="size-3 text-amber-300" />
            ডেমো প্রেজেন্টেশন মোড (১-ক্লিক রোল সুইচ)
          </span>
        </div>

        {/* Center / Right: Glassmorphism Segmented Role Switcher Pills */}
        <div
          role="group"
          aria-label="Select Demo Workspace Role"
          className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 p-0.5 shadow-inner backdrop-blur-md select-none"
        >
          {/* Role 1: Food Donor */}
          <Link
            href={ROUTES.donor.dashboard}
            title="খাদ্যদাতা ড্যাশবোর্ডে যান"
            className={cn(
              "group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer select-none",
              activeRole === "donor"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-950/50 font-black ring-1 ring-white/30"
                : "border border-transparent text-white/80 hover:border-white/20 hover:bg-white/15 hover:text-white hover:-translate-y-0.5 active:translate-y-0",
            )}
          >
            <span className="transition-transform duration-200 group-hover:scale-125 group-hover:rotate-6">👨‍🍳</span>
            <span>খাদ্যদাতা</span>
          </Link>

          {/* Role 2: NGO Foundation */}
          <Link
            href={ROUTES.ngo.dashboard}
            title="মাস্তুল এনজিও ড্যাশবোর্ডে যান"
            className={cn(
              "group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer select-none",
              activeRole === "ngo"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-950/50 font-black ring-1 ring-white/30"
                : "border border-transparent text-white/80 hover:border-white/20 hover:bg-white/15 hover:text-white hover:-translate-y-0.5 active:translate-y-0",
            )}
          >
            <span className="transition-transform duration-200 group-hover:scale-125 group-hover:rotate-6">🏢</span>
            <span>মাস্তুল এনজিও</span>
          </Link>

          {/* Role 3: Volunteer Rider */}
          <Link
            href={ROUTES.volunteer.dashboard}
            title="ভলান্টিয়ার কমান্ড হাবে যান"
            className={cn(
              "group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer select-none",
              activeRole === "volunteer"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-950/50 font-black ring-1 ring-white/30"
                : "border border-transparent text-white/80 hover:border-white/20 hover:bg-white/15 hover:text-white hover:-translate-y-0.5 active:translate-y-0",
            )}
          >
            <span className="transition-transform duration-200 group-hover:scale-125 group-hover:-rotate-6">🚴</span>
            <span>ভলান্টিয়ার রাইডার</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
