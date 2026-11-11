"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Clock,
  ExternalLink,
  HandHeart,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useMockAuth } from "@/features/auth/mock-auth";
import {
  fetchRealNotifications,
  markAllRealNotificationsRead,
  markRealNotificationRead,
  type RealNotification,
} from "@/lib/notifications/real-notification-client";
import type { PortalRole } from "@/types/navigation";
import { cn } from "@/lib/utils";

const NOTIFICATION_ICONS: Record<
  string,
  { icon: LucideIcon; bg: string; text: string; label: string }
> = {
  URGENT: {
    icon: Zap,
    bg: "bg-rose-50 border-rose-200",
    text: "text-rose-600",
    label: "জরুরি রেসকিউ",
  },
  PICKUP: {
    icon: Truck,
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    label: "পিকআপ উইন্ডো",
  },
  VOLUNTEER: {
    icon: UsersRound,
    bg: "bg-sky-50 border-sky-200",
    text: "text-sky-700",
    label: "ভলান্টিয়ার রাইডার",
  },
  CLAIM: {
    icon: HandHeart,
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    label: "খাদ্য ক্লেইম",
  },
  NEARBY_DONATION: {
    icon: MapPin,
    bg: "bg-teal-50 border-teal-200",
    text: "text-teal-700",
    label: "নিকটস্থ খাদ্য",
  },
  DELIVERY: {
    icon: PackageCheck,
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-800",
    label: "বিতরণ সম্পন্ন",
  },
  IMPACT: {
    icon: Sparkles,
    bg: "bg-purple-50 border-purple-200",
    text: "text-purple-700",
    label: "ইমপ্যাক্ট আপডেট",
  },
  SYSTEM: {
    icon: ShieldCheck,
    bg: "bg-slate-100 border-slate-200",
    text: "text-slate-700",
    label: "সিস্টেম ও সিকিউরিটি",
  },
};

function formatRelativeTime(dateString: string) {
  const timestamp = Date.parse(dateString);
  if (isNaN(timestamp)) return "এইমাত্র";
  const diffMinutes = Math.round((Date.now() - timestamp) / 60000);
  if (diffMinutes < 1) return "এইমাত্র";
  if (diffMinutes < 60) return `${diffMinutes} মিনিট আগে`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} দিন আগে`;
}

export function NotificationPopover({
  role,
  notificationHref,
  className,
}: {
  role: PortalRole;
  notificationHref: string;
  className?: string;
}) {
  const router = useRouter();
  const { session } = useMockAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD">("ALL");
  const [busy, setBusy] = useState(false);
  const [notifications, setNotifications] = useState<RealNotification[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    const res = await fetchRealNotifications(role, session?.email);
    setNotifications(res.notifications);
  }, [role, session?.email]);

  useEffect(() => {
    void loadNotifications();

    // 5-second polling interval for multi-device sync
    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 5000);

    // Event listeners for instant local tab and broadcasted updates
    const handleNotification = (event: Event) => {
      const customEvent = event as CustomEvent<RealNotification>;
      const notif = customEvent.detail;
      if (!notif) {
        void loadNotifications();
        return;
      }

      // Check if notification is meant for this role or user
      const matchesRole = !notif.role || notif.role === "ALL" || notif.role.toLowerCase() === role.toLowerCase();
      const matchesUser = !notif.userId || notif.userId.toLowerCase() === (session?.email ?? "").toLowerCase();

      if (matchesRole && matchesUser) {
        setNotifications((prev) => {
          if (prev.some((item) => item.id === notif.id)) return prev;
          return [notif, ...prev];
        });
      }
    };

    const handleReadAll = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const handleReadOne = (event: Event) => {
      const customEvent = event as CustomEvent<{ id: string }>;
      const id = customEvent.detail?.id;
      if (id) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      }
    };

    window.addEventListener("sharebite:notification", handleNotification);
    window.addEventListener("sharebite:notification-read-all", handleReadAll);
    window.addEventListener("sharebite:notification-read", handleReadOne);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("sharebite:notification", handleNotification);
      window.removeEventListener("sharebite:notification-read-all", handleReadAll);
      window.removeEventListener("sharebite:notification-read", handleReadOne);
    };
  }, [loadNotifications, role, session?.email]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const visibleNotifications = useMemo(() => {
    if (activeTab === "UNREAD") {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, activeTab]);

  async function handleMarkAllAsRead() {
    setBusy(true);
    try {
      await markAllRealNotificationsRead(role, session?.email);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } finally {
      setBusy(false);
    }
  }

  async function handleItemClick(item: RealNotification) {
    if (!item.read) {
      void markRealNotificationRead(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
    }
    setIsOpen(false);
    if (item.href && item.href !== "#") {
      router.push(item.href);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "relative grid size-9 place-items-center rounded-xl border transition-all cursor-pointer shadow-2xs",
          isOpen
            ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20"
            : "border-slate-200/80 bg-white/90 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
        )}
        aria-label={`${unreadCount}টি অপঠিত নোটিফিকেশন`}
        aria-expanded={isOpen}
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4.5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white shadow-xs ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Modern Popover Dropdown */}
      {isOpen && (
        <div className="absolute -right-2 sm:right-0 top-full mt-2.5 w-[calc(100vw-32px)] max-w-[390px] rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-400/30 z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 font-heading">
                লাইভ নোটিফিকেশন
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 font-heading">
                  {unreadCount}টি নতুন
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={busy}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors font-heading cursor-pointer disabled:opacity-50"
              >
                <CheckCheck className="size-3.5" /> সব পঠিত করুন
              </button>
            )}
          </div>

          {/* Sub Filter Tabs */}
          <div className="flex border-b border-slate-100 px-3 pt-2 text-xs font-bold font-heading bg-white">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={cn(
                "pb-2 px-3 border-b-2 transition-all cursor-pointer",
                activeTab === "ALL"
                  ? "border-emerald-600 text-emerald-700 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              সব ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("UNREAD")}
              className={cn(
                "pb-2 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1",
                activeTab === "UNREAD"
                  ? "border-emerald-600 text-emerald-700 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              অপঠিত
              {unreadCount > 0 && (
                <span className="size-1.5 rounded-full bg-emerald-600" />
              )}
            </button>
          </div>

          {/* Notification Items List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {visibleNotifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Bell className="mx-auto size-9 stroke-[1.5] text-slate-300" />
                <p className="mt-2 text-xs font-bold text-slate-600 font-heading">
                  কোনো নোটিফিকেশন নেই
                </p>
                <p className="text-[11px] text-slate-400 font-normal">
                  {activeTab === "UNREAD"
                    ? "আপনার সব নোটিফিকেশন পড়া সম্পন্ন হয়েছে।"
                    : "নতুন খাদ্য উদ্ধার ও ক্লেইম আপডেট এখানে দেখাবে।"}
                </p>
              </div>
            ) : (
              visibleNotifications.map((item) => {
                const meta =
                  NOTIFICATION_ICONS[item.type] ?? NOTIFICATION_ICONS.SYSTEM;
                const Icon = meta.icon;
                const isUnread = !item.read;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer text-left",
                      isUnread
                        ? "bg-emerald-50/40 hover:bg-emerald-50/70"
                        : "bg-white hover:bg-slate-50"
                    )}
                  >
                    {/* Category Icon */}
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-xl border text-xs shadow-2xs mt-0.5",
                        meta.bg,
                        meta.text
                      )}
                    >
                      <Icon className="size-4.5" />
                    </span>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                          {meta.label}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <Clock className="size-2.5 text-slate-400" />
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>

                      <h4
                        className={cn(
                          "mt-0.5 text-xs font-heading leading-snug line-clamp-1",
                          isUnread
                            ? "font-black text-slate-900 group-hover:text-emerald-700"
                            : "font-bold text-slate-700"
                        )}
                      >
                        {item.title}
                      </h4>

                      <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 line-clamp-2 font-normal">
                        {item.message}
                      </p>
                    </div>

                    {/* Unread Indicator */}
                    {isUnread && (
                      <span className="mt-2 size-2.5 shrink-0 rounded-full bg-emerald-600 shadow-xs ring-2 ring-emerald-100" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer: View All Notifications Page */}
          <div className="border-t border-slate-100 bg-slate-50/70 p-2.5 text-center">
            <Link
              href={notificationHref}
              onClick={() => setIsOpen(false)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-white py-2 text-xs font-bold text-slate-800 shadow-2xs border border-slate-200/80 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition-all font-heading"
            >
              সব নোটিফিকেশন দেখুন <ExternalLink className="size-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
