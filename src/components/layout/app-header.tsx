"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  Command,
  HeartHandshake,
  MapPin,
  Menu,
  PackageCheck,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const items = getNavigation(role) as DesktopNavItem[];

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
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 min-w-0 max-w-[var(--page-max-width)] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Drawer Trigger, Mobile Logo & Desktop Search */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="flex size-9 items-center justify-center rounded-xl border border-slate-200/90 text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="size-5" />
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
        <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          {/* Live Impact Rescues Pill (Clean, Subtle, Single Line) */}
          <div className="hidden xl:inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-600/15 bg-emerald-50/50 px-3 text-xs font-semibold text-emerald-950 shadow-2xs">
            <Sparkles className="size-3.5 text-emerald-600 shrink-0" />
            <span>
              <strong className="font-bold text-emerald-950">৪,৩৪০+</strong> মিল উদ্ধার
            </span>
          </div>

          {/* Subtle Vertical Divider */}
          <div className="hidden xl:block h-5 w-px bg-slate-200/80" />

          {/* Segmented iOS-Style Language Selector */}
          <LanguageSwitch />

          {/* Facebook-Style Notification Bell */}
          <NotificationPopover
            role={role}
            notificationHref={
              notificationHref ??
              (role === "donor"
                ? ROUTES.donor.notifications
                : role === "volunteer"
                ? ROUTES.volunteer.dashboard
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

      {/* Mobile Drawer Slide-Over for Mobile Navigation */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-[#02241b] p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-emerald-800/40 pb-4">
              <BrandLogo href={ROUTES.home} inverse />
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="rounded-lg p-1.5 text-emerald-300 hover:bg-emerald-900/50 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="mt-6 flex-1 space-y-1.5 overflow-y-auto">
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
                      "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                      isItemActive
                        ? "bg-emerald-800/80 text-white font-bold ring-1 ring-emerald-500/40"
                        : "text-emerald-100 hover:bg-emerald-800/40"
                    )}
                  >
                    <Icon className="size-5 text-emerald-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-emerald-800/40 pt-4">
              <p className="text-xs text-emerald-300 font-medium">ShareBite BD Enterprise Platform</p>
              <p className="text-[11px] text-emerald-400/60 mt-0.5">Emergency Dispatch: +880 9612-SHARE</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
