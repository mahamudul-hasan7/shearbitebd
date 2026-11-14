"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { notificationMessage } from "@/lib/i18n/notification-copy";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import { NotificationIcon } from "@/components/notifications/notification-item";
import styles from "@/components/notifications/notifications.module.css";
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
  const tx = useUiText();
  const { session } = useMockAuth();
  const owner = session?.id;
  const [snapshot, setSnapshot] = useState<{ owner: string; item: RealNotification }>();
  const [closingId, setClosingId] = useState<string>();
  const seenIdsRef = useRef<Set<string>>(new Set());
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const toast = snapshot?.owner === owner ? snapshot?.item : undefined;

  const dismiss = useCallback((id: string, sessionId: string) => {
    clearTimeout(dismissTimerRef.current); clearTimeout(exitTimerRef.current);
    const remove = () => setSnapshot(previous => previous?.owner === sessionId && previous.item.id === id ? undefined : previous);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { remove(); return; }
    setClosingId(id);
    exitTimerRef.current = setTimeout(remove, 160);
  }, []);
  const showToast = useCallback((item: RealNotification, sessionId: string) => {
    if (seenIdsRef.current.has(item.id)) return;
    seenIdsRef.current.add(item.id);
    clearTimeout(dismissTimerRef.current); clearTimeout(exitTimerRef.current);
    setClosingId(undefined); setSnapshot({ owner:sessionId, item }); playNotificationChime();
    dismissTimerRef.current = setTimeout(() => dismiss(item.id, sessionId), 7000);
  }, [dismiss]);

  useEffect(() => {
    if (!owner) return;
    let active = true;
    let initial = true;
    let inFlight = false;
    seenIdsRef.current.clear();
    async function checkNew() {
      if (inFlight) return;
      inFlight = true;
      const result = await fetchRealNotifications().catch(() => undefined);
      inFlight = false;
      if (!result || !active) return;
      if (initial) {
        for (const item of result.notifications) seenIdsRef.current.add(item.id);
        initial = false; return;
      }
      const item = result.notifications.find(item => !item.read && !seenIdsRef.current.has(item.id));
      if (item) showToast(item, owner!);
    }
    void checkNew();
    const timer = setInterval(() => { void checkNew(); }, 5000);
    const onNotification = () => { void checkNew(); };
    window.addEventListener("sharebite:notification", onNotification);
    return () => {
      active = false; clearInterval(timer); clearTimeout(dismissTimerRef.current); clearTimeout(exitTimerRef.current);
      window.removeEventListener("sharebite:notification", onNotification);
    };
  }, [owner, showToast]);

  if (!toast || !owner) return null;
  const pause = () => clearTimeout(dismissTimerRef.current);
  const resume = () => {
    clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => dismiss(toast.id, owner), 7000);
  };
  return <aside key={toast.id} aria-label={tx("New notification")} aria-live="polite" aria-atomic="true" className={styles.toast} data-closing={closingId === toast.id}
    onMouseEnter={pause} onMouseLeave={event => { if (!event.currentTarget.contains(document.activeElement)) resume(); }}
    onFocusCapture={pause} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) resume(); }}>
    <div className={styles.toastTop}><NotificationIcon type={toast.type} motion="once" /><div className={styles.toastBody}>
      <h3>{tx(toast.title)}</h3><p>{notificationMessage(tx,toast)}</p>
      {toast.href && toast.href !== "#" && <Link href={toast.href} className={styles.toastLink} onClick={() => dismiss(toast.id,owner)}>{tx("See notification details")}<ArrowUpRight size={15} aria-hidden="true" /></Link>}
    </div><button type="button" className={styles.iconButton} aria-label={tx("Close notification")} onClick={() => dismiss(toast.id,owner)}><X size={18} aria-hidden="true" /></button></div>
  </aside>;
}
