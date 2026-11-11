"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Bell, ExternalLink, X, Zap } from "lucide-react";
import { useMockAuth } from "@/features/auth/mock-auth";
import {
  fetchRealNotifications,
  type RealNotification,
} from "@/lib/notifications/real-notification-client";

function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Pleasant two-tone chime
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.45);
  } catch {
    // AudioContext might be blocked until user gesture, safely ignore
  }
}

export function RealNotificationToast() {
  const { session } = useMockAuth();
  const [toast, setToast] = useState<RealNotification | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((notif: RealNotification) => {
    if (seenIdsRef.current.has(notif.id)) return;
    seenIdsRef.current.add(notif.id);

    setToast(notif);
    playNotificationChime();

    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }
    dismissTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 7000);
  }, []);

  // Poll for background cross-device notifications
  useEffect(() => {
    async function checkNew() {
      const res = await fetchRealNotifications(session?.role, session?.email);
      if (isInitialLoadRef.current) {
        // Mark existing as seen so we don't alert old ones on first load
        for (const item of res.notifications) {
          seenIdsRef.current.add(item.id);
        }
        isInitialLoadRef.current = false;
        return;
      }

      for (const item of res.notifications) {
        if (!item.read && !seenIdsRef.current.has(item.id)) {
          showToast(item);
          break;
        }
      }
    }

    void checkNew();
    const interval = setInterval(() => {
      void checkNew();
    }, 5000);

    const handleEvent = (event: Event) => {
      const customEvent = event as CustomEvent<RealNotification>;
      const notif = customEvent.detail;
      if (notif) {
        // Verify user / role match
        const matchesRole = !notif.role || notif.role === "ALL" || notif.role.toLowerCase() === (session?.role ?? "").toLowerCase();
        const matchesUser = !notif.userId || notif.userId.toLowerCase() === (session?.email ?? "").toLowerCase();

        if (matchesRole && matchesUser) {
          showToast(notif);
        }
      }
    };

    window.addEventListener("sharebite:notification", handleEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener("sharebite:notification", handleEvent);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [session?.email, session?.role, showToast]);

  if (!toast) return null;

  return (
    <aside
      aria-label="নতুন নোটিফিকেশন বিজ্ঞপ্তি"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] rounded-2xl border border-emerald-500/30 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-md">
          <Bell className="size-5 animate-bounce" />
          <span className="absolute -top-1 -right-1 size-3 rounded-full bg-rose-500 ring-2 ring-slate-900" />
        </div>

        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-400 font-heading">
              <Zap className="size-3" /> লাইভ আপডেট
            </span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="grid size-6 place-items-center rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="বন্ধ করুন"
            >
              <X className="size-4" />
            </button>
          </div>

          <h4 className="mt-1 text-xs font-black font-heading text-white line-clamp-1">
            {toast.title}
          </h4>

          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-300 line-clamp-2">
            {toast.message}
          </p>

          {toast.href && toast.href !== "#" && (
            <div className="mt-2.5 flex items-center justify-end">
              <Link
                href={toast.href}
                onClick={() => setToast(null)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-black font-heading text-white shadow-xs hover:bg-emerald-500 transition-colors"
              >
                <span>দেখুন</span>
                <ExternalLink className="size-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
