"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellRing,
  Bike,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  Heart,
  KeyRound,
  Laptop,
  Lock,
  LogOut,
  MapPin,
  Moon,
  Phone,
  Power,
  Radio,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  UserCheck,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useMockAuth } from "@/features/auth/mock-auth";
import { useVolunteerStore } from "@/features/volunteer-dashboard/volunteer-store";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { PortalRole } from "@/types/navigation";

export function ProfilePopover({
  role,
  profileName,
  profileDescription,
  avatarInitials,
}: {
  role: PortalRole;
  profileName?: string;
  profileDescription?: string;
  avatarInitials?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { session, signOut } = useMockAuth();
  const volunteerStore = useVolunteerStore();

  // Personal In-Popup Preference States (Not in sidebar!)
  const [loudAlertSound, setLoudAlertSound] = useState(true);
  const [smsBackupAlert, setSmsBackupAlert] = useState(true);
  const [preferredZone, setPreferredZone] = useState("badda_gulshan");
  const [nightVisionOled, setNightVisionOled] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const isVolunteer = role === "volunteer";
  const isDonor = role === "donor";
  const isNgo = role === "ngo";

  // Handle outside click & escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function showToast(msg: string) {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 2500);
  }

  function handleLogout() {
    signOut();
    setIsOpen(false);
    router.push(ROUTES.auth.login);
  }

  // Display texts
  const displayName =
    profileName ??
    (isVolunteer
      ? volunteerStore.profile.fullName
      : isDonor
      ? "ইউআইইউ ক্যাফেটেরিয়া"
      : "হোপ ফাউন্ডেশন");

  const emailText =
    session?.email ??
    (isVolunteer
      ? "tanvir.volunteer@sharebite.bd"
      : isDonor
      ? "donor@sharebite.demo"
      : "ngo@sharebite.demo");

  const initials =
    avatarInitials ??
    (isVolunteer
      ? volunteerStore.profile.avatarInitials
      : isDonor
      ? "UC"
      : "HF");

  return (
    <div className="relative" ref={containerRef}>
      {/* Profile Trigger Button in Top Right Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={cn(
          "flex h-9 items-center gap-2 rounded-xl border px-2.5 transition-all text-left shadow-2xs group cursor-pointer",
          isOpen
            ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20"
            : "border-slate-200/80 bg-white/90 hover:bg-slate-50 hover:border-slate-300"
        )}
        title="ব্যক্তিগত প্রোফাইল ও নিরাপত্তা সেটিংস"
      >
        <div className="relative shrink-0">
          <span className="grid size-6 place-items-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-800 ring-1 ring-emerald-600/20">
            {initials ? initials.slice(0, 2).toUpperCase() : "U"}
          </span>
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 size-2 rounded-full ring-1.5 ring-white",
              isVolunteer
                ? volunteerStore.dutyStatus === "online"
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-slate-400"
                : "bg-emerald-500"
            )}
          />
        </div>

        <div className="hidden min-w-0 max-w-36 text-left sm:block">
          <p className="truncate text-xs font-bold leading-tight text-ink-900 group-hover:text-emerald-950">
            {displayName}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold truncate leading-none mt-0.5">
            <span>
              {isVolunteer
                ? volunteerStore.dutyStatus === "online"
                  ? "অন-ডিউটি"
                  : "অফ-ডিউটি"
                : isDonor
                ? "খাদ্য দাতা"
                : "এনজিও পার্টনার"}
            </span>
          </div>
        </div>

        <ChevronDown
          className={cn(
            "size-3 text-slate-400 transition-transform duration-200 ml-0.5",
            isOpen && "rotate-180 text-emerald-700"
          )}
        />
      </button>

      {/* Top Right Dropdown Popover */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="User Account Settings"
          className="absolute right-0 top-full mt-2.5 z-50 w-84 sm:w-92 rounded-3xl border border-line bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Temporary feedback notice */}
          {toastNotice && (
            <div className="bg-emerald-600 text-white text-[11px] font-bold px-4 py-1.5 text-center animate-in fade-in">
              {toastNotice}
            </div>
          )}

          {/* Section 1: User Identity Card (Personal info) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#02241b] via-[#033428] to-[#011812] p-5 text-white border-b border-emerald-800/40">
            <div className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-emerald-500/15 blur-xl" />

            <div className="relative z-10 flex items-start gap-3.5">
              <div className="relative size-12 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-lg grid place-items-center shadow-md ring-2 ring-white/20">
                {initials}
                <span className="absolute -bottom-1 -right-1 grid size-4.5 place-items-center rounded-full bg-emerald-500 text-white ring-2 ring-brand-950">
                  <CheckCircle2 className="size-3" />
                </span>
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <h4 className="text-base font-black text-white truncate">{displayName}</h4>
                <p className="text-xs text-emerald-200/80 truncate font-mono">{emailText}</p>
                <p className="text-[11px] text-emerald-300 font-medium">
                  {isVolunteer ? volunteerStore.profile.phone : "+880 1700-000001"}
                </p>

                <div className="pt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-200 border border-emerald-400/30">
                    <ShieldCheck className="size-3 text-emerald-400" />
                    <span>NID ও BFSA ভেরিফায়েড</span>
                  </span>

                  {isVolunteer && (
                    <span className="font-mono text-[10px] font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                      রক্ত: {volunteerStore.profile.bloodGroup.split(" ")[0]}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* In-Popup Operational Duty & Shift Switch (Volunteer specific) */}
            {isVolunteer && (
              <div className="relative z-10 mt-4 rounded-2xl bg-emerald-950/60 p-3 border border-emerald-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">
                      ডিউটি মোড ও শিফট
                    </span>
                    <p className="text-xs font-black text-white flex items-center gap-1.5 mt-0.5">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          volunteerStore.dutyStatus === "online"
                            ? "bg-emerald-400 animate-pulse"
                            : "bg-slate-400"
                        )}
                      />
                      <span>
                        {volunteerStore.dutyStatus === "online" ? "অন-ডিউটি সক্রিয়" : "অফ-ডিউটি (বিরতি)"}
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      volunteerStore.toggleDutyStatus();
                      showToast(
                        volunteerStore.dutyStatus === "online"
                          ? "অফ-ডিউটি মোডে স্যুইচ করা হয়েছে"
                          : "অন-ডিউটি মোড সক্রিয় হয়েছে!"
                      );
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition-all border shadow-xs",
                      volunteerStore.dutyStatus === "online"
                        ? "bg-emerald-600 text-white border-emerald-400/60"
                        : "bg-slate-800 text-slate-300 border-slate-600"
                    )}
                  >
                    <Power className="size-3.5" />
                    <span>{volunteerStore.dutyStatus === "online" ? "অফ করুন" : "অন করুন"}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-emerald-800/40 flex items-center justify-between text-[11px] text-emerald-200/80">
                  <span>🏍️ বাহন: {volunteerStore.profile.vehicleType.split("(")[0]}</span>
                  <span className="text-amber-300 font-mono font-bold">
                    {volunteerStore.profile.vehicleRegNo.split(" ")[2]}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Personal Preferences & Dispatch Controls (NOT in sidebar) */}
          <div className="p-4 space-y-3.5 max-h-80 overflow-y-auto">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-500">
              ব্যক্তিগত রেসকিউ সেটিংস ও প্রিফারেন্স
            </p>

            {/* Preferred Rescue Zone */}
            <div className="space-y-1 rounded-2xl bg-canvas p-3 border border-line">
              <label className="flex items-center gap-2 text-xs font-bold text-ink-900">
                <MapPin className="size-3.5 text-emerald-600" />
                <span>পছন্দের উদ্ধার এলাকা (Primary Zone)</span>
              </label>
              <p className="text-[11px] text-muted-500">
                কেবল এই এলাকার ডিসপ্যাচ রিকুয়েস্ট প্রথমে আপনার কাছে আসবে
              </p>
              <select
                value={preferredZone}
                onChange={(e) => {
                  setPreferredZone(e.target.value);
                  showToast("পছন্দের এলাকা আপডেট হয়েছে!");
                }}
                className="mt-1 w-full rounded-xl border border-line bg-white px-2.5 py-1.5 text-xs font-bold text-ink-900 focus:border-emerald-600 focus:outline-hidden"
              >
                <option value="badda_gulshan">বাড্ডা, গুলশান ও হাতিরঝিল করিডোর</option>
                <option value="dhanmondi">ধানমন্ডি, পান্থপথ ও শুক্রাবাদ</option>
                <option value="mirpur">মিরপুর ১০ ও ১২ রেসকিউ হাব</option>
                <option value="all_metro">সমগ্র ঢাকা মেট্রো (আনলিমিটেড)</option>
              </select>
            </div>

            {/* Toggle 1: Loud Dispatch Alert Audio Sound */}
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-canvas p-3 border border-line">
              <div className="flex items-start gap-2.5">
                <div className="grid size-7 place-items-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  {loudAlertSound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-ink-900">জরুরি ডিসপ্যাচ সাইরেন অডিও</p>
                  <p className="text-[11px] text-muted-500">
                    নতুন খাবার এলে বাইকে থাকা অবস্থায় লাউড বিজার বাজবে
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLoudAlertSound(!loudAlertSound);
                  showToast(!loudAlertSound ? "সাইরেন সাউন্ড চালু হয়েছে 🔊" : "সাউন্ড মিউট করা হয়েছে 🔇");
                }}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                  loudAlertSound ? "bg-emerald-600" : "bg-slate-300"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transform ring-0 transition ease-in-out duration-200",
                    loudAlertSound ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Toggle 2: SMS Backup for Low Network */}
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-canvas p-3 border border-line">
              <div className="flex items-start gap-2.5">
                <div className="grid size-7 place-items-center rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                  <Smartphone className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink-900">এসএমএস ব্যাকআপ নোটিফিকেশন</p>
                  <p className="text-[11px] text-muted-500">
                    মোবাইল ডাটা না থাকলে সরাসরি ফোনে জরুরি টেক্সট মেসেজ যাবে
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSmsBackupAlert(!smsBackupAlert);
                  showToast(!smsBackupAlert ? "এসএমএস ব্যাকআপ সক্রিয়" : "এসএমএস ব্যাকআপ বন্ধ");
                }}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                  smsBackupAlert ? "bg-emerald-600" : "bg-slate-300"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transform ring-0 transition ease-in-out duration-200",
                    smsBackupAlert ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Emergency & Family Contact Card */}
            {isVolunteer && (
              <div className="rounded-2xl border border-rose-200/80 bg-rose-50/60 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                    <ShieldAlert className="size-3.5 text-rose-600" />
                    <span>জরুরি অভিভাবক হটলাইন</span>
                  </span>
                  <span className="rounded bg-rose-200/70 px-1.5 py-0.2 text-[9px] font-black text-rose-800">
                    EMERGENCY
                  </span>
                </div>
                <p className="text-xs font-mono font-bold text-rose-950">
                  {volunteerStore.profile.emergencyContact}
                </p>
                <p className="text-[10px] text-rose-800/80">
                  অনাকাঙ্ক্ষিত দুর্ঘটনায় শেয়ারবাইট বিডি হেল্পডেস্ক এই নম্বরে তাৎক্ষণিক অবহিত করবে।
                </p>
              </div>
            )}

            {/* Session Security & Device info */}
            <div className="rounded-2xl bg-canvas p-3 border border-line space-y-1.5 text-xs">
              <p className="font-bold text-ink-900 flex items-center gap-1.5">
                <Laptop className="size-3.5 text-emerald-600" />
                <span>সক্রিয় সেশন ও ডিভাইস নিরাপত্তা</span>
              </p>
              <p className="text-[11px] text-muted-600">
                লগইনকৃত: <strong>Chrome / Next.js Demo Session</strong>
              </p>
              <p className="text-[10px] text-emerald-700 font-medium">
                আইপি সিকিউরিটি হ্যাশ: 2026.BD.AUTH.VERIFIED 🟢
              </p>
            </div>
          </div>

          {/* Section 3: Logout Action Footer */}
          <div className="p-3 border-t border-line bg-canvas/80 flex items-center justify-between">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100/70 hover:text-rose-900 transition-colors"
            >
              <LogOut className="size-4" />
              <span>লগআউট করুন (Sign Out)</span>
            </button>

            <span className="text-[10px] text-muted-400 font-mono">
              ShareBite v2.4 BD
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
