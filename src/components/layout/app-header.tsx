"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Bike,
  Building2,
  Calendar,
  CheckCircle2,
  Command,
  Globe,
  HeartHandshake,
  MapPin,
  Menu,
  PackageCheck,
  Phone,
  Search,
  Sparkles,
  Truck,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { NotificationPopover } from "@/components/layout/notification-popover";
import { ProfilePopover } from "@/components/layout/profile-popover";
import { getNavigation, DesktopNavItem } from "@/lib/navigation";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { PortalRole } from "@/types/navigation";

export function AppHeader({
  role,
  activeHref,
  eyebrow = "ShareBite BD Portal",
  profileName,
  profileDescription,
  avatarInitials,
  notificationHref,
  unreadNotifications = 0,
}: {
  role: PortalRole;
  activeHref?: string;
  eyebrow?: string;
  description?: string;
  profileName?: string;
  profileDescription?: string;
  avatarInitials?: string;
  notificationHref?: string;
  unreadNotifications?: number;
}) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const items = getNavigation(role) as DesktopNavItem[];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileDrawerOpen]);

  // Focus mobile search input when opened
  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
    }
  }, [mobileSearchOpen]);

  // Global keyboard shortcut (⌘K or Ctrl+K) to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close search suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const QUICK_SEARCH_ITEMS = [
    {
      title: "UIU ক্যাফেটেরিয়া — ১০০ প্যাকেট খিচুড়ি",
      subtitle: "মাদানী এভিনিউ, বাড্ডা · জরুরি উদ্ধার",
      badge: "জরুরি",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      icon: Zap,
      href: role === "volunteer" ? ROUTES.volunteer.dashboard : ROUTES.donor.donations,
    },
    {
      title: "আশিয়ান ফুড ব্যাংক (মিরপুর-১০ শাখা)",
      subtitle: "সার্টিফাইড পার্টনার এনজিও · পিকআপ স্টেশন",
      badge: "এনজিও",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: HeartHandshake,
      href: ROUTES.ngo.dashboard,
    },
    {
      title: "ধানমন্ডি লেকভিউ ক্লাব উদ্বৃত্ত খাবার",
      subtitle: "রোড ৮/এ, ধানমন্ডি · প্যাকেজ প্রস্তুত",
      badge: "খাদ্য অনুদান",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Utensils,
      href: ROUTES.donor.donations,
    },
    {
      title: "লাইভ ডিসপ্যাচ ও ভলান্টিয়ার কমান্ড",
      subtitle: "ঢাকা মেট্রো এরিয়া টেলিমেট্রি",
      badge: "রিয়েলটাইম",
      badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
      icon: Truck,
      href: ROUTES.volunteer.dispatches,
    },
  ];

  const filteredItems = searchQuery.trim()
    ? QUICK_SEARCH_ITEMS.filter(
        (i) =>
          i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : QUICK_SEARCH_ITEMS;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/75 backdrop-blur-xl backdrop-saturate-150 transition-colors shadow-[0_4px_30px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white before:to-transparent">
      <div className="mx-auto flex h-16 min-w-0 max-w-[var(--page-max-width)] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Drawer Trigger, Mobile Logo & Desktop Search */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="flex size-10 items-center justify-center rounded-xl border border-slate-200/90 text-slate-700 hover:bg-slate-100 active:scale-90 lg:hidden cursor-pointer touch-manipulation shadow-2xs"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="size-5.5" />
          </button>

          <div className="lg:hidden">
            <BrandLogo compact />
          </div>

          {/* Desktop Search Bar with Command Palette trigger */}
          <div ref={searchContainerRef} className="relative hidden lg:flex items-center">
            <Search className="pointer-events-none absolute left-3 size-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="খাদ্য অনুদান, এনজিও বা স্থান খুঁজুন..."
              className="h-9 w-60 lg:w-72 xl:w-80 rounded-xl border border-slate-200/80 bg-slate-100/70 pl-9 pr-12 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/15 focus:outline-hidden transition-all shadow-2xs"
            />
            <kbd className="pointer-events-none absolute right-2.5 hidden sm:inline-flex items-center rounded border border-slate-200/80 bg-white px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 shadow-2xs">
              ⌘K
            </kbd>

            {/* Quick Interactive Search Popover */}
            {isSearchFocused && (
              <div className="absolute left-0 top-full mt-2 w-80 lg:w-96 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl z-50 animate-in fade-in zoom-in-95 text-left">
                <div className="flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>দ্রুত অ্যাক্সেস ও ফলাফল</span>
                  <span className="font-mono text-[10px] font-medium lowercase">
                    {filteredItems.length} টি সাজেশন
                  </span>
                </div>

                <div className="mt-1 space-y-1">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        onClick={() => setIsSearchFocused(false)}
                        className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-800 group-hover:text-emerald-950">
                            {item.title}
                          </p>
                          <p className="truncate text-[11px] text-slate-500">
                            {item.subtitle}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold",
                            item.badgeColor
                          )}
                        >
                          {item.badge}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Region / Coverage Pill (Single Line & Elegant) */}
          <div className="hidden lg:inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-900/10 bg-emerald-50/60 px-3 text-xs font-semibold text-emerald-950 shadow-2xs">
            <span className="relative flex size-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-emerald-600" />
            </span>
            <MapPin className="size-3.5 text-emerald-700 shrink-0" />
            <span className="font-bold">ঢাকা মেট্রো</span>
            <span className="text-[11px] text-emerald-700/80 font-normal hidden xl:inline">
              (গুলশান · ধানমন্ডি · মিরপুর)
            </span>
          </div>
        </div>

        {/* Right: Live Impact Stat, Language, Notifications, Profile */}
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
          {/* Mobile Search Trigger Button */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            className="flex size-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white/90 text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer active:scale-95 transition-all shadow-2xs"
            aria-label="Search"
          >
            <Search className="size-4" />
          </button>

          {/* Live Impact Rescues Pill (Clean, Subtle, Single Line) */}
          <div className="hidden xl:inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-600/15 bg-emerald-50/50 px-3 text-xs font-semibold text-emerald-950 shadow-2xs">
            <Sparkles className="size-3.5 text-emerald-600 shrink-0" />
            <span>
              <strong className="font-bold text-emerald-950">৪,৩৪০+</strong> মিল উদ্ধার
            </span>
          </div>

          {/* Subtle Vertical Divider */}
          <div className="hidden xl:block h-5 w-px bg-slate-200/80" />

          {/* Segmented iOS-Style Language Selector (Desktop/Tablet; on mobile it is in Profile Popover & Drawer) */}
          <div className="hidden sm:inline-flex">
            <LanguageSwitch />
          </div>

          {/* Facebook-Style Notification Bell */}
          <NotificationPopover
            role={role}
            notificationHref={
              notificationHref ??
              (role === "donor"
                ? ROUTES.donor.notifications
                : role === "volunteer"
                ? ROUTES.volunteer.notifications
                : ROUTES.ngo.notifications)
            }
          />

          {/* Subtle Vertical Divider */}
          <div className="hidden sm:block h-5 w-px bg-slate-200/80" />

          {/* User Profile Popover */}
          <ProfilePopover
            role={role}
            profileName={profileName}
            profileDescription={profileDescription}
            avatarInitials={avatarInitials}
          />
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-x-0 top-0 z-50 bg-white p-3 border-b border-line shadow-xl animate-in slide-in-from-top duration-200 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="খাদ্য অনুদান, এনজিও বা স্থান খুঁজুন..."
                className="h-10 w-full rounded-xl border border-emerald-500 bg-slate-50 pl-9 pr-3 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen(false);
                setSearchQuery("");
              }}
              className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-600 active:scale-95"
              aria-label="Close search"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Mobile search suggestions */}
          <div className="mt-3 max-h-72 overflow-y-auto space-y-1 divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={() => {
                    setMobileSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="flex items-center gap-3 pt-2.5 pb-1.5 active:bg-emerald-50 rounded-xl px-2 transition-colors group"
                >
                  <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800">
                      {item.title}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {item.subtitle}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold",
                      item.badgeColor
                    )}
                  >
                    {item.badge}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Drawer Slide-Over for Mobile Navigation (Rendered in Portal to escape header containing block) */}
      {mounted && mobileDrawerOpen && createPortal(
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-[#02241b] text-white shadow-2xl animate-in slide-in-from-left duration-250 overflow-hidden">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-emerald-800/40 p-4">
              <BrandLogo href={ROUTES.home} inverse />
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="rounded-xl p-2 text-emerald-300 hover:bg-emerald-900/50 active:scale-90 cursor-pointer touch-manipulation"
                aria-label="Close menu"
              >
                <X className="size-5.5" />
              </button>
            </div>

            {/* User Identity Card */}
            <div className="p-4 bg-emerald-950/50 border-b border-emerald-800/40 flex items-center gap-3">
              <div className="relative size-11 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-base grid place-items-center shadow-md ring-2 ring-emerald-400/30">
                {avatarInitials || (role === "donor" ? "UIU" : role === "volunteer" ? "SB" : "MF")}
                <span className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-emerald-500 text-white ring-1 ring-[#02241b]">
                  <CheckCircle2 className="size-2.5" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-white truncate">
                  {profileName || (role === "donor" ? "ইউআইইউ ক্যাফেটেরিয়া" : role === "volunteer" ? "রাকিব হাসান" : "মাস্তুল ফাউন্ডেশন")}
                </p>
                <p className="text-[11px] text-emerald-300/80 truncate">
                  {profileDescription || (role === "donor" ? "ভেরিফায়েড খাদ্যদাতা" : role === "volunteer" ? "রেসকিউ রাইডার" : "পার্টনার এনজিও")}
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1 overscroll-contain">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/60 px-3 pb-1">
                মেনু নেভিগেশন
              </p>
              {items.map((item) => {
                const Icon = item.icon;
                const isItemActive =
                  activeHref &&
                  (item.href === activeHref ||
                    (item.href.includes("/volunteer/missions") &&
                      activeHref.includes("/volunteer/missions")));
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all active:scale-98 select-none touch-manipulation",
                      isItemActive
                        ? "bg-emerald-600 text-white font-black shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/40"
                        : "text-emerald-100 hover:bg-emerald-800/40 active:bg-emerald-800/60"
                    )}
                  >
                    <Icon className={cn("size-5 shrink-0", isItemActive ? "text-white" : "text-emerald-400")} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Drawer Footer with Mobile Language Switch */}
            <div className="border-t border-emerald-800/40 p-4 space-y-3 bg-[#011b14]">
              {/* Mobile Language Switcher Row */}
              <div className="flex items-center justify-between rounded-xl bg-emerald-950/80 border border-emerald-800/50 p-2.5">
                <span className="flex items-center gap-2 text-xs font-bold text-emerald-200">
                  <Globe className="size-4 text-emerald-400" />
                  <span>ভাষা (Language)</span>
                </span>
                <LanguageSwitch variant="dark" />
              </div>

              <a
                href="tel:+880961274273"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-900/70 border border-emerald-700/50 py-2.5 px-3 text-xs font-bold text-emerald-200 hover:bg-emerald-800 active:scale-95 transition-all touch-manipulation"
              >
                <Phone className="size-3.5 text-emerald-400" />
                <span>জরুরি রেসকিউ: +৮৮০ ৯৬১২-SHARE</span>
              </a>
              <div className="flex items-center justify-between text-[10px] text-emerald-400/60 pt-1">
                <span>ShareBite BD Enterprise</span>
                <span className="font-mono">v2.4 PWA</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
