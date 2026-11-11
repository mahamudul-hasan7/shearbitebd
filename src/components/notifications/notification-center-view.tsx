"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  HandHeart,
  Mail,
  MapPin,
  MessageSquare,
  PackageCheck,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Truck,
  UsersRound,
  Volume2,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { ROUTES } from "@/lib/routes";
import { useMockAuth } from "@/features/auth/mock-auth";
import {
  fetchRealNotifications,
  markAllRealNotificationsRead,
  markRealNotificationRead,
  type RealNotification,
} from "@/lib/notifications/real-notification-client";
import type { PortalRole } from "@/types/navigation";
import { cn } from "@/lib/utils";

type FilterTab = "ALL" | "UNREAD" | "URGENT" | "CLAIMS" | "LOGISTICS" | "SYSTEM";

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: LucideIcon; badgeColor: string; iconBg: string; iconColor: string }
> = {
  URGENT: {
    label: "অতি জরুরি",
    icon: Zap,
    badgeColor: "bg-rose-50 text-rose-800 ring-rose-600/20",
    iconBg: "bg-rose-50 border-rose-200",
    iconColor: "text-rose-600",
  },
  PICKUP: {
    label: "পিকআপ উইন্ডো",
    icon: Truck,
    badgeColor: "bg-amber-50 text-amber-800 ring-amber-600/20",
    iconBg: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-700",
  },
  VOLUNTEER: {
    label: "ভলান্টিয়ার রাইডার",
    icon: UsersRound,
    badgeColor: "bg-sky-50 text-sky-800 ring-sky-600/20",
    iconBg: "bg-sky-50 border-sky-200",
    iconColor: "text-sky-700",
  },
  CLAIM: {
    label: "খাদ্য ক্লেইম ও ম্যাচ",
    icon: HandHeart,
    badgeColor: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
    iconBg: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-700",
  },
  NEARBY_DONATION: {
    label: "নিকটস্থ খাদ্য অ্যালার্ট",
    icon: MapPin,
    badgeColor: "bg-teal-50 text-teal-800 ring-teal-600/20",
    iconBg: "bg-teal-50 border-teal-200",
    iconColor: "text-teal-700",
  },
  DELIVERY: {
    label: "বিতরণ সম্পন্ন",
    icon: PackageCheck,
    badgeColor: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
    iconBg: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-800",
  },
  IMPACT: {
    label: "ইমপ্যাক্ট রেকর্ড",
    icon: Sparkles,
    badgeColor: "bg-purple-50 text-purple-800 ring-purple-600/20",
    iconBg: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-700",
  },
  SYSTEM: {
    label: "সিস্টেম ও সিকিউরিটি",
    icon: ShieldCheck,
    badgeColor: "bg-slate-100 text-slate-800 ring-slate-400/20",
    iconBg: "bg-slate-100 border-slate-200",
    iconColor: "text-slate-700",
  },
};


function formatDetailedDate(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("bn-BD", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
}

function getTimeCategory(dateString: string): "TODAY" | "YESTERDAY" | "EARLIER" {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "TODAY";
  if (diffDays === 1) return "YESTERDAY";
  return "EARLIER";
}

export function NotificationCenterView({
  role,
  title = "নোটিফিকেশন ও অ্যালার্ট সেন্টার",
  description = "উদ্বৃত্ত খাদ্য উদ্ধার, ক্লেইম স্ট্যাটাস, রাইডার ট্র্যাকিং ও সিস্টেমের লাইভ নোটিফিকেশনসমূহ।",
  profileName,
  profileDescription,
  avatarInitials,
}: {
  role: PortalRole;
  title?: string;
  description?: string;
  profileName?: string;
  profileDescription?: string;
  avatarInitials?: string;
}) {
  const { session } = useMockAuth();
  const [filterTab, setFilterTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [busyId, setBusyId] = useState<string>();
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Preference switches state
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);

  // Notifications state from live DB API
  const [notifications, setNotifications] = useState<RealNotification[]>([]);

  const loadNotifications = useCallback(async () => {
    const res = await fetchRealNotifications(role, session?.email);
    setNotifications(res.notifications);
  }, [role, session?.email]);

  useEffect(() => {
    void loadNotifications();

    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 5000);

    const handleNotification = (event: Event) => {
      const customEvent = event as CustomEvent<RealNotification>;
      const notif = customEvent.detail;
      if (!notif) {
        void loadNotifications();
        return;
      }

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

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const urgentCount = useMemo(() => {
    return notifications.filter((n) => n.type === "URGENT").length;
  }, [notifications]);

  const completedCount = useMemo(() => {
    return notifications.filter((n) => n.type === "DELIVERY").length;
  }, [notifications]);

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Tab matching
      let tabMatch = true;
      if (filterTab === "UNREAD") tabMatch = !item.read;
      else if (filterTab === "URGENT") tabMatch = item.type === "URGENT";
      else if (filterTab === "CLAIMS") tabMatch = item.type === "CLAIM" || item.type === "NEARBY_DONATION";
      else if (filterTab === "LOGISTICS") tabMatch = item.type === "VOLUNTEER" || item.type === "PICKUP" || item.type === "DELIVERY";
      else if (filterTab === "SYSTEM") tabMatch = item.type === "SYSTEM" || item.type === "IMPACT";

      // Search query matching
      const query = searchQuery.trim().toLowerCase();
      let queryMatch = true;
      if (query) {
        queryMatch =
          item.title.toLowerCase().includes(query) ||
          item.message.toLowerCase().includes(query);
      }

      return tabMatch && queryMatch;
    });
  }, [notifications, filterTab, searchQuery]);

  // Group by Time
  const groupedNotifications = useMemo(() => {
    const today: RealNotification[] = [];
    const yesterday: RealNotification[] = [];
    const earlier: RealNotification[] = [];

    filteredNotifications.forEach((item) => {
      const category = getTimeCategory(item.createdAt);
      if (category === "TODAY") today.push(item);
      else if (category === "YESTERDAY") yesterday.push(item);
      else earlier.push(item);
    });

    return { today, yesterday, earlier };
  }, [filteredNotifications]);

  async function toggleRead(item: RealNotification) {
    setBusyId(item.id);
    try {
      await markRealNotificationRead(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
    } finally {
      setBusyId(undefined);
    }
  }

  async function markAllRead() {
    setBusyId("all");
    try {
      await markAllRealNotificationsRead(role, session?.email);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } finally {
      setBusyId(undefined);
    }
  }

  function handleDismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const notificationHref = role === "donor" ? ROUTES.donor.notifications : ROUTES.ngo.notifications;

  return (
    <PortalShell
      role={role}
      activeHref={notificationHref}
      title={title}
      description={description}
      profileName={profileName}
      profileDescription={profileDescription}
      avatarInitials={avatarInitials}
      notificationHref={notificationHref}
      unreadNotifications={unreadCount}
      actions={
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSettingsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors font-heading cursor-pointer"
          >
            <SlidersHorizontal className="size-3.5 text-slate-500" />
            <span>প্রেফারেন্স</span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              disabled={busyId === "all"}
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors font-heading cursor-pointer disabled:opacity-50"
            >
              <CheckCheck className="size-4" />
              <span>সব পঠিত করুন</span>
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* 1. Summary Metric Tiles */}
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 font-heading">মোট নোটিফিকেশন</span>
              <span className="grid size-8 place-items-center rounded-xl bg-slate-100 text-slate-700">
                <Bell className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900 font-heading">
              {notifications.length}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">রিয়েল-টাইম রেজিস্ট্রি</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 font-heading">অপঠিত নোটিফিকেশন</span>
              <span className="grid size-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <BellRing className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-emerald-700 font-heading">
              {unreadCount}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">
              {unreadCount > 0 ? "পড়ার অপেক্ষায়" : "সব পড়া সম্পন্ন"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 font-heading">জরুরি রেসকিউ</span>
              <span className="grid size-8 place-items-center rounded-xl bg-amber-50 text-amber-700">
                <Zap className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-amber-600 font-heading">
              {urgentCount}
            </p>
            <p className="text-[11px] text-amber-700 font-medium">পিকআপ উইন্ডো সক্রিয়</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 font-heading">সফল বিতরণ</span>
              <span className="grid size-8 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <PackageCheck className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-teal-700 font-heading">
              {completedCount}
            </p>
            <p className="text-[11px] text-teal-600 font-medium">রেকর্ড নিশ্চিত</p>
          </div>
        </div>

        {/* 2. Search & Category Filters Bar */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="শিরোনাম বা বিবরণ দিয়ে নোটিফিকেশন খুঁজুন..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-hidden transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold font-heading">
              {(
                [
                  { key: "ALL", label: "সব", count: notifications.length },
                  { key: "UNREAD", label: "অপঠিত", count: unreadCount },
                  { key: "URGENT", label: "জরুরি", count: urgentCount },
                  {
                    key: "CLAIMS",
                    label: "খাদ্য ক্লেইম",
                    count: notifications.filter(
                      (n) => n.type === "CLAIM" || n.type === "NEARBY_DONATION"
                    ).length,
                  },
                  {
                    key: "LOGISTICS",
                    label: "লজিস্টিক্স",
                    count: notifications.filter(
                      (n) =>
                        n.type === "VOLUNTEER" ||
                        n.type === "PICKUP" ||
                        n.type === "DELIVERY"
                    ).length,
                  },
                  {
                    key: "SYSTEM",
                    label: "সিস্টেম",
                    count: notifications.filter(
                      (n) => n.type === "SYSTEM" || n.type === "IMPACT"
                    ).length,
                  },
                ] as const
              ).map((tab) => {
                const isActive = filterTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilterTab(tab.key)}
                    className={cn(
                      "shrink-0 rounded-xl px-3 py-2 transition-all cursor-pointer flex items-center gap-1.5",
                      isActive
                        ? "bg-emerald-600 text-white font-black shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                        isActive ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-700"
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Grouped Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-2xs">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <Bell className="size-7 stroke-[1.5]" />
            </div>
            <h3 className="mt-4 text-base font-black text-slate-900 font-heading">
              কোনো নোটিফিকেশন পাওয়া যায়নি
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
              {searchQuery
                ? `"${searchQuery}" এর সাথে মিলে এমন কোনো নোটিফিকেশন নেই। ফিল্টার মুছে আবার চেষ্টা করুন।`
                : "নির্বাচিত ক্যাটাগরিতে এই মুহূর্তে কোনো নোটিফিকেশন নেই।"}
            </p>
            {(searchQuery || filterTab !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setFilterTab("ALL");
                  setSearchQuery("");
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 font-heading cursor-pointer"
              >
                সব নোটিফিকেশন দেখুন
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* TODAY GROUP */}
            {groupedNotifications.today.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 px-1 text-xs font-black uppercase tracking-wider text-slate-400 font-heading">
                  <Clock className="size-3.5 text-emerald-600" />
                  <span>আজকের নোটিফিকেশন ({groupedNotifications.today.length})</span>
                </div>
                <div className="space-y-2.5">
                  {groupedNotifications.today.map((item) => (
                    <NotificationItemCard
                      key={item.id}
                      item={item}
                      busy={busyId === item.id}
                      onToggleRead={() => toggleRead(item)}
                      onDismiss={() => handleDismiss(item.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* YESTERDAY GROUP */}
            {groupedNotifications.yesterday.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 px-1 text-xs font-black uppercase tracking-wider text-slate-400 font-heading">
                  <Clock className="size-3.5 text-slate-400" />
                  <span>গতকাল ({groupedNotifications.yesterday.length})</span>
                </div>
                <div className="space-y-2.5">
                  {groupedNotifications.yesterday.map((item) => (
                    <NotificationItemCard
                      key={item.id}
                      item={item}
                      busy={busyId === item.id}
                      onToggleRead={() => toggleRead(item)}
                      onDismiss={() => handleDismiss(item.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* EARLIER GROUP */}
            {groupedNotifications.earlier.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 px-1 text-xs font-black uppercase tracking-wider text-slate-400 font-heading">
                  <Clock className="size-3.5 text-slate-400" />
                  <span>পূর্বে / এই সপ্তাহে ({groupedNotifications.earlier.length})</span>
                </div>
                <div className="space-y-2.5">
                  {groupedNotifications.earlier.map((item) => (
                    <NotificationItemCard
                      key={item.id}
                      item={item}
                      busy={busyId === item.id}
                      onToggleRead={() => toggleRead(item)}
                      onDismiss={() => handleDismiss(item.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Notification Preferences Modal */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-left">
            <button
              type="button"
              onClick={() => setSettingsModalOpen(false)}
              className="absolute top-5 right-5 grid size-8 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 font-heading ring-1 ring-emerald-600/20">
              <Settings className="size-3.5 text-emerald-600" />
              নোটিফিকেশন সেটিংস
            </span>

            <h3 className="mt-3 text-xl font-black text-slate-900 font-heading">
              অ্যালার্ট ও নোটিফিকেশন প্রেফারেন্স
            </h3>
            <p className="mt-1 text-xs text-slate-500 font-normal">
              জরুরি খাদ্য উদ্ধার এবং ওটিপি অ্যালার্ট গ্রহণের চ্যানেলগুলো নিয়ন্ত্রণ করুন।
            </p>

            <div className="mt-5 space-y-3.5 divide-y divide-slate-100 text-xs">
              {/* SMS Alerts */}
              <div className="flex items-center justify-between pt-3.5">
                <div className="pr-4">
                  <p className="font-bold text-slate-900 font-heading flex items-center gap-1.5">
                    <MessageSquare className="size-3.5 text-emerald-600" />
                    মোবাইল এসএমএস অ্যালার্ট
                  </p>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                    খাদ্য ক্লেইম, ডেলিভারি ও হ্যান্ডওভার ওটিপি সরাসরি ফোনে পাঠানো হবে।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsAlerts(!smsAlerts)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden",
                    smsAlerts ? "bg-emerald-600" : "bg-slate-300"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block size-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out mt-0.5 ml-0.5",
                      smsAlerts ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {/* Push Alerts */}
              <div className="flex items-center justify-between pt-3.5">
                <div className="pr-4">
                  <p className="font-bold text-slate-900 font-heading flex items-center gap-1.5">
                    <Bell className="size-3.5 text-emerald-600" />
                    ব্রাউজার পুশ নোটিফিকেশন
                  </p>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                    ট্যাব ব্যাকগ্রাউন্ডে থাকলেও লাইভ খাদ্য উদ্ধার আপডেট প্রদর্শিত হবে।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPushAlerts(!pushAlerts)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden",
                    pushAlerts ? "bg-emerald-600" : "bg-slate-300"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block size-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out mt-0.5 ml-0.5",
                      pushAlerts ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {/* Email Digest */}
              <div className="flex items-center justify-between pt-3.5">
                <div className="pr-4">
                  <p className="font-bold text-slate-900 font-heading flex items-center gap-1.5">
                    <Mail className="size-3.5 text-emerald-600" />
                    দৈনিক সারাংশ ইমেইল
                  </p>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                    প্রতিদিনের খাদ্য অপচয় রোধ ও কার্বন হ্রাসের সারসংক্ষেপ।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailDigest(!emailDigest)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden",
                    emailDigest ? "bg-emerald-600" : "bg-slate-300"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block size-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out mt-0.5 ml-0.5",
                      emailDigest ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {/* Sound Alerts */}
              <div className="flex items-center justify-between pt-3.5">
                <div className="pr-4">
                  <p className="font-bold text-slate-900 font-heading flex items-center gap-1.5">
                    <Volume2 className="size-3.5 text-emerald-600" />
                    জরুরি অ্যালার্ট সাউন্ড
                  </p>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                    ১৫ মিনিটের রেসকিউ উইন্ডো সক্রিয় হলে অডিও বিপ বাজবে।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundAlerts(!soundAlerts)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden",
                    soundAlerts ? "bg-emerald-600" : "bg-slate-300"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block size-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out mt-0.5 ml-0.5",
                      soundAlerts ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSettingsModalOpen(false)}
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-sm hover:bg-emerald-700 transition-colors font-heading cursor-pointer"
              >
                সেটিংস সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}

function NotificationItemCard({
  item,
  busy,
  onToggleRead,
  onDismiss,
}: {
  item: RealNotification;
  busy: boolean;
  onToggleRead: () => void;
  onDismiss: () => void;
}) {
  const meta = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.SYSTEM;
  const Icon = meta.icon;
  const isUnread = !item.read;

  return (
    <div
      className={cn(
        "group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 transition-all duration-200 shadow-2xs",
        isUnread
          ? "border-emerald-300/80 bg-emerald-50/40 border-l-4 border-l-emerald-600 hover:bg-emerald-50/70"
          : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/80"
      )}
    >
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {/* Category Icon */}
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-2xl border shadow-2xs mt-0.5",
            meta.iconBg,
            meta.iconColor
          )}
        >
          <Icon className="size-5" />
        </span>

        {/* Content Details */}
        <div className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ring-1 font-heading",
                meta.badgeColor
              )}
            >
              {meta.label}
            </span>

            {isUnread && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white font-heading">
                <span className="size-1.5 rounded-full bg-white animate-pulse" />
                নতুন
              </span>
            )}

            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 ml-auto">
              <Clock className="size-3 text-slate-400" />
              {formatDetailedDate(item.createdAt)}
            </span>
          </div>

          <h4
            className={cn(
              "mt-1.5 text-sm font-heading leading-snug",
              isUnread ? "font-black text-slate-900" : "font-bold text-slate-700"
            )}
          >
            {item.title}
          </h4>

          <p className="mt-1 text-xs leading-relaxed text-slate-600 line-clamp-2">
            {item.message}
          </p>
        </div>
      </div>

      {/* Right Side Action Buttons */}
      <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
        {item.href && item.href !== "#" && (
          <Link
            href={item.href}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition-colors font-heading"
          >
            <span>কার্যক্রম দেখুন</span>
            <ExternalLink className="size-3.5" />
          </Link>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={onToggleRead}
          title={isUnread ? "পঠিত হিসেবে চিহ্নিত করুন" : "অপঠিত করুন"}
          className={cn(
            "grid size-8 place-items-center rounded-xl border transition-colors cursor-pointer disabled:opacity-50",
            isUnread
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          )}
        >
          {isUnread ? <Check className="size-4" /> : <Clock className="size-4" />}
        </button>

        <button
          type="button"
          onClick={onDismiss}
          title="মুছে ফেলুন"
          className="grid size-8 place-items-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
