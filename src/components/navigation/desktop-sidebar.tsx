"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  Bike,
  Building2,
  Check,
  ChevronRight,
  ChevronsUpDown,
  Compass,
  FileQuestion,
  Headphones,
  HeartHandshake,
  History,
  LayoutDashboard,
  LogOut,
  MapPin,
  Navigation,
  PhoneCall,
  Plus,
  QrCode,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Truck,
  UserRound,
  Zap,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Avatar } from "@/components/ui/avatar";
import { getNavigation, roleMeta, DesktopNavItem } from "@/lib/navigation";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { mockAppStore } from "@/store/mock-app-store";
import { useVolunteerStore } from "@/features/volunteer-dashboard/volunteer-store";
import type { PortalRole } from "@/types/navigation";

export function DesktopSidebar({
  role,
  activeHref,
  profileName,
  profileDescription,
  avatarInitials,
}: {
  role: PortalRole;
  activeHref: string;
  profileName?: string;
  profileDescription?: string;
  avatarInitials?: string;
}) {
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const volunteerStore = useVolunteerStore();
  const isVolunteer = role === "volunteer";
  const isDonor = role === "donor";
  const isNgo = role === "ngo";

  const rawItems = getNavigation(role, activeHref.startsWith("/preview/")) as DesktopNavItem[];
  const items = rawItems.map((item) => {
    if (isVolunteer && item.label === "লাইভ মিশন" && volunteerStore.activeMission?.id) {
      return {
        ...item,
        href: ROUTES.volunteer.mission(volunteerStore.activeMission.id),
      };
    }
    return item;
  });

  const isItemActive = (itemHref: string) => {
    if (itemHref === activeHref) return true;
    if (
      itemHref.includes("/volunteer/missions") &&
      activeHref.includes("/volunteer/missions")
    ) {
      return true;
    }
    if (itemHref === ROUTES.donor.donations && activeHref.startsWith("/donor/donations")) {
      return true;
    }
    if (itemHref === ROUTES.ngo.claims && activeHref.startsWith("/ngo/claims")) {
      return true;
    }
    return false;
  };

  // Unread notifications subscription
  const [unreadCount, setUnreadCount] = useState(() => {
    const userId = isNgo
      ? "user-ngo-hope"
      : isVolunteer
      ? "user-volunteer-demo"
      : "user-donor-uiu";
    return mockAppStore
      .getSnapshot()
      .notifications.filter((n) => n.userId === userId && !n.readAt).length;
  });

  useEffect(() => {
    const userId = isNgo
      ? "user-ngo-hope"
      : isVolunteer
      ? "user-volunteer-demo"
      : "user-donor-uiu";
    const updateCount = () => {
      setUnreadCount(
        mockAppStore
          .getSnapshot()
          .notifications.filter((n) => n.userId === userId && !n.readAt).length
      );
    };
    return mockAppStore.subscribe(updateCount);
  }, [role, isNgo, isVolunteer]);

  // Click outside listener for workspace switcher dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (workspaceRef.current && !workspaceRef.current.contains(event.target as Node)) {
        setWorkspaceMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setWorkspaceMenuOpen(false);
    }
    if (workspaceMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [workspaceMenuOpen]);

  const mainItems = items.filter((i) => i.category === "main");
  const operationItems = items.filter((i) => i.category === "operations" && !i.isPrimary);
  const systemItems = items.filter((i) => i.category === "system");
  const primaryAction = items.find((i) => i.isPrimary);

  // Active Workspace Identity
  const workspaceIdentity = isVolunteer
    ? {
        name: "ঢাকা সেন্ট্রাল রেসকিউ স্কোয়াড",
        type: "ভলান্টিয়ার কমান্ড সেন্টার",
        code: "DH-ALPHA SQUAD",
        icon: Bike,
        badge: "কমান্ড হাব",
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      }
    : isDonor
    ? {
        name: "ইউআইইউ গ্রিন ক্যাফেটেরিয়া",
        type: "খাদ্য দাতা এন্টারপ্রাইজ",
        code: "DONOR-DH-UIU",
        icon: Building2,
        badge: "ভেরিফায়েড দাতা",
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      }
    : {
        name: "মাস্তুল ফাউন্ডেশন হাব",
        type: "সার্টিফাইড এনজিও নেটওয়ার্ক",
        code: "NGO-REG-9482",
        icon: HeartHandshake,
        badge: "এনজিও পার্টনার",
        badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
      };

  const WorkspaceIcon = workspaceIdentity.icon;

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-[var(--sidebar-width)] flex-col border-r border-[#0d3b2e]/80 bg-[#021812] text-slate-100 shadow-2xl lg:flex select-none"
      aria-label={`${roleMeta[role].label} Navigation`}
    >
      {/* Ambient Radial Cyber Glow Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-20 size-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/2 -right-24 size-64 rounded-full bg-teal-500/5 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 size-72 rounded-full bg-emerald-600/10 blur-3xl" />
      </div>

      {/* Top Header: Brand Logo & Live Signal */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#0e4435]/60 bg-[#021c15]/50 backdrop-blur-md">
        <BrandLogo href={ROUTES.home} inverse />
        <div className="flex items-center gap-1.5">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
            LIVE BD
          </span>
        </div>
      </div>

      {/* Executive Workspace Switcher (Replaces clunky tabs) */}
      <div className="relative z-20 px-3.5 pt-3.5 pb-2" ref={workspaceRef}>
        <button
          type="button"
          onClick={() => setWorkspaceMenuOpen((prev) => !prev)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-2xl border p-2 text-left transition-all cursor-pointer shadow-md",
            workspaceMenuOpen
              ? "border-emerald-500/60 bg-emerald-950/80 ring-2 ring-emerald-500/20"
              : "border-emerald-900/60 bg-gradient-to-r from-[#03241b] to-[#042d22] hover:border-emerald-700/60 hover:bg-[#053528]"
          )}
          title="ওয়ার্কস্পেস ও পোর্টাল নির্বাচন করুন"
        >
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-950/80 ring-1 ring-white/20">
            <WorkspaceIcon className="size-4.5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-xs font-bold text-white tracking-tight">
                {workspaceIdentity.name}
              </p>
            </div>
            <p className="truncate text-[10px] font-semibold text-emerald-300/80">
              {workspaceIdentity.type}
            </p>
          </div>

          <ChevronsUpDown className="size-4 shrink-0 text-emerald-400/80 transition-transform" />
        </button>

        {/* Workspace Dropdown Menu */}
        {workspaceMenuOpen && (
          <div className="absolute left-3.5 right-3.5 top-full mt-2 rounded-2xl border border-emerald-700/60 bg-[#022118] p-2 shadow-2xl shadow-black/80 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95">
            <div className="px-2.5 py-1.5 text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest border-b border-emerald-800/40">
              পোর্টাল স্যুইচ করুন · Switch Workspace
            </div>

            <div className="mt-1 space-y-1">
              {/* Option 1: Donor */}
              <Link
                href={ROUTES.donor.dashboard}
                onClick={() => setWorkspaceMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-xl p-2 transition-all group",
                  isDonor
                    ? "bg-emerald-800/50 text-white font-bold ring-1 ring-emerald-500/40"
                    : "text-emerald-200/80 hover:bg-emerald-900/40 hover:text-white"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-emerald-900/60 text-emerald-300">
                    <Building2 className="size-3.5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold truncate">খাদ্য দাতা পোর্টাল</p>
                    <p className="text-[10px] text-emerald-400/70 truncate">উদ্বৃত্ত খাবার পোস্ট ও ট্র্যাকিং</p>
                  </div>
                </div>
                {isDonor && <Check className="size-3.5 text-emerald-400 shrink-0" />}
              </Link>

              {/* Option 2: NGO */}
              <Link
                href={ROUTES.ngo.dashboard}
                onClick={() => setWorkspaceMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-xl p-2 transition-all group",
                  isNgo
                    ? "bg-emerald-800/50 text-white font-bold ring-1 ring-emerald-500/40"
                    : "text-emerald-200/80 hover:bg-emerald-900/40 hover:text-white"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-teal-900/60 text-teal-300">
                    <HeartHandshake className="size-3.5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold truncate">এনজিও পার্টনার হাব</p>
                    <p className="text-[10px] text-teal-400/70 truncate">খাদ্য ক্লেইম ও বিতরণ নেটওয়ার্ক</p>
                  </div>
                </div>
                {isNgo && <Check className="size-3.5 text-emerald-400 shrink-0" />}
              </Link>

              {/* Option 3: Volunteer */}
              <Link
                href={ROUTES.volunteer.dashboard}
                onClick={() => setWorkspaceMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-xl p-2 transition-all group",
                  isVolunteer
                    ? "bg-emerald-800/50 text-white font-bold ring-1 ring-emerald-500/40"
                    : "text-emerald-200/80 hover:bg-emerald-900/40 hover:text-white"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-emerald-900/60 text-emerald-300">
                    <Bike className="size-3.5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold truncate">ভলান্টিয়ার কমান্ড সেন্টার</p>
                    <p className="text-[10px] text-emerald-400/70 truncate">লাইভ ডিসপ্যাচ ও টেলিমেট্রি</p>
                  </div>
                </div>
                {isVolunteer && <Check className="size-3.5 text-emerald-400 shrink-0" />}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic High-Impact Primary Action CTA (Only for donor & NGO, not duplicate for volunteer) */}
      {!isVolunteer && (
        <div className="relative z-10 px-3.5 pt-1 pb-2">
          {isDonor ? (
            <Link
              href={ROUTES.donor.newDonation}
              className="group relative flex w-full items-center justify-between overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 px-3.5 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-950/70 transition-all hover:from-emerald-400 hover:to-teal-500 hover:shadow-emerald-600/30 active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <Plus className="size-4 stroke-[3] transition-transform group-hover:rotate-90" />
                <span>উদ্বৃত্ত খাবার পোস্ট</span>
              </div>
              <Sparkles className="size-3.5 text-emerald-100" />
            </Link>
          ) : (
            <Link
              href={ROUTES.ngo.discover}
              className="group relative flex w-full items-center justify-between overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 px-3.5 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-950/70 transition-all hover:from-emerald-400 hover:to-teal-500 hover:shadow-emerald-600/30 active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <Search className="size-4 transition-transform group-hover:scale-110" />
                <span>খাদ্য সন্ধান ও ক্লেইম</span>
              </div>
              <Compass className="size-3.5 text-teal-100" />
            </Link>
          )}
        </div>
      )}

      {/* Navigation Sections */}
      <nav
        className="relative z-10 flex-1 overflow-y-auto px-3.5 py-2.5 space-y-4 text-xs font-medium"
        aria-label="Sidebar Navigation Menu"
      >
        {/* Core Workspace Section */}
        <div>
          <div className="flex items-center justify-between px-2.5 pb-1.5 text-[9px] font-extrabold uppercase tracking-widest text-emerald-400/60">
            <span>{isVolunteer ? "কমান্ড ও নেভিগেশন" : isDonor ? "ডোনার হাব ও ওভারভিউ" : "এনজিও হাব ও ওভারভিউ"}</span>
          </div>
          <div className="space-y-1">
            {mainItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center justify-between rounded-xl px-3 py-2 transition-all duration-150 cursor-pointer",
                    active
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-700/95 text-white font-bold shadow-md shadow-emerald-950/70 ring-1 ring-emerald-400/40"
                      : "text-slate-300 hover:bg-emerald-900/35 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-transform group-hover:scale-110",
                        active ? "text-white drop-shadow-[0_1px_3px_rgba(255,255,255,0.4)]" : "text-emerald-400/80 group-hover:text-emerald-300"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {active && <ChevronRight className="size-3.5 text-emerald-200/90 shrink-0" />}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Operations & Logistics Section */}
        {operationItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-2.5 pb-1.5 text-[9px] font-extrabold uppercase tracking-widest text-emerald-400/60">
              <span>{isVolunteer ? "উদ্ধার ও ডিসপ্যাচ" : isDonor ? "খাদ্য অনুদান ও লজিস্টিকস" : "অপারেশন ও রেসকিউ"}</span>
            </div>
            <div className="space-y-1">
              {operationItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.href);
                const isLive = item.badge === "লাইভ" || item.badge === "Live";
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center justify-between rounded-xl px-3 py-2 transition-all duration-150 cursor-pointer",
                      active
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-700/95 text-white font-bold shadow-md shadow-emerald-950/70 ring-1 ring-emerald-400/40"
                        : "text-slate-300 hover:bg-emerald-900/35 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-transform group-hover:scale-110",
                          active ? "text-white drop-shadow-[0_1px_3px_rgba(255,255,255,0.4)]" : "text-emerald-400/80 group-hover:text-emerald-300"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-black shrink-0",
                          isLive
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        )}
                      >
                        {isLive && <span className="size-1.5 rounded-full bg-rose-400" />}
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* System & Support Section */}
        {systemItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-2.5 pb-1.5 text-[9px] font-extrabold uppercase tracking-widest text-emerald-400/60">
              <span>{isVolunteer ? "আইডেন্টিটি ও সনদ" : isDonor ? "অ্যাকাউন্ট ও সেটিংস" : "সিস্টেম ও হেল্প"}</span>
            </div>
            <div className="space-y-1">
              {systemItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.href);
                const isNotification = item.href.includes("notifications");
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center justify-between rounded-xl px-3 py-2 transition-all duration-150 cursor-pointer",
                      active
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-700/95 text-white font-bold shadow-md shadow-emerald-950/70 ring-1 ring-emerald-400/40"
                        : "text-slate-300 hover:bg-emerald-900/35 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-transform group-hover:scale-110",
                          active ? "text-white drop-shadow-[0_1px_3px_rgba(255,255,255,0.4)]" : "text-emerald-400/80 group-hover:text-emerald-300"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {isNotification && unreadCount > 0 && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white shadow-xs animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </nav>

      {/* Footer Verified User Profile & Quick Duty Card */}
      <div className="relative z-10 border-t border-[#0e4435]/60 bg-[#021c15]/90 p-3">
        <div className="flex items-center justify-between gap-2 rounded-xl bg-emerald-950/60 p-2 border border-emerald-800/40">
          <Link
            href={
              isVolunteer
                ? ROUTES.volunteer.idCard
                : isDonor
                ? ROUTES.donor.profile
                : ROUTES.ngo.profile
            }
            title="ভেরিফায়েড আইডি কার্ড দেখুন"
            className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-95 transition-opacity"
          >
            <div className="relative shrink-0">
              <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-xs font-black text-white shadow-xs">
                {avatarInitials ?? (isDonor ? "FD" : isNgo ? "NG" : "VL")}
              </span>
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 size-2 rounded-full ring-1.5 ring-[#021c15]",
                  isVolunteer
                    ? volunteerStore.dutyStatus === "online"
                      ? "bg-emerald-400 animate-pulse"
                      : "bg-slate-400"
                    : "bg-emerald-400"
                )}
              />
            </div>

            <div className="min-w-0 text-left">
              <p className="truncate text-xs font-bold text-white hover:text-emerald-300 transition-colors">
                {profileName ?? (isVolunteer ? volunteerStore.profile.fullName : roleMeta[role].label)}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold truncate">
                <ShieldCheck className="size-3 text-emerald-400 shrink-0" />
                <span className="truncate">
                  {isVolunteer
                    ? volunteerStore.dutyStatus === "online"
                      ? "অন-ডিউটি 🟢"
                      : "অফ-ডিউটি ⚪"
                    : isDonor
                    ? "ভেরিফায়েড দাতা"
                    : "সার্টিফাইড এনজিও"}
                </span>
              </div>
            </div>
          </Link>

          {/* Quick Duty Status Switcher for Volunteer, or Settings for others */}
          {isVolunteer ? (
            <button
              type="button"
              onClick={volunteerStore.toggleDutyStatus}
              title={`ডিউটি স্ট্যাটাস পরিবর্তন করুন (বর্তমান: ${
                volunteerStore.dutyStatus === "online" ? "অনলাইন" : "অফলাইন"
              })`}
              className={cn(
                "rounded-lg p-1.5 text-xs font-bold transition-all cursor-pointer border",
                volunteerStore.dutyStatus === "online"
                  ? "border-emerald-600 bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800"
                  : "border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white"
              )}
            >
              {volunteerStore.dutyStatus === "online" ? "ON" : "OFF"}
            </button>
          ) : (
            <Link
              href={isDonor ? ROUTES.donor.settings : ROUTES.ngo.settings}
              title="সেটিংস"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-900/50 hover:text-white transition-colors"
            >
              <Settings className="size-4" />
            </Link>
          )}

          {/* Logout Shortcut */}
          <Link
            href={ROUTES.auth.login}
            title="লগআউট করুন"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-950/60 hover:text-rose-300 transition-colors"
          >
            <LogOut className="size-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
