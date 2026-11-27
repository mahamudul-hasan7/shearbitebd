"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMockAuth } from "@/features/auth/mock-auth";
import { fetchRealNotifications, markAllRealNotificationsRead, markRealNotificationRead, type RealNotification } from "./real-notification-client";

export function useNotificationFeed() {
  const { session, status } = useMockAuth();
  const sessionId = session?.id;
  const [snapshot, setSnapshot] = useState<{ sessionId: string; notifications: RealNotification[]; error: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const spinTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const controller = new AbortController();
    let revision = 0;
    const load = (manual = false) => {
      const current = ++revision;
      const startedAt = Date.now();
      if (manual) {
        if (spinTimer.current !== null) {
          window.clearTimeout(spinTimer.current);
          spinTimer.current = null;
        }
        setRefreshing(true);
      }
      void fetchRealNotifications(undefined, undefined, controller.signal).then(({ notifications }) => {
        if (!controller.signal.aborted && current === revision) setSnapshot({ sessionId, notifications, error: "" });
      }).catch(() => {
        if (!controller.signal.aborted && current === revision) setSnapshot((previous) => ({ sessionId, notifications: previous?.sessionId === sessionId ? previous.notifications : [], error: "Notifications could not load. Please retry." }));
      }).finally(() => {
        if (!manual || controller.signal.aborted) return;
        const remaining = Math.max(0, 550 - (Date.now() - startedAt));
        spinTimer.current = window.setTimeout(() => {
          spinTimer.current = null;
          setRefreshing(false);
        }, remaining);
      });
    };
    const onManualChanged = () => load(true);
    const onSilentSync = () => load(false);
    load(false);
    const timer = window.setInterval(onSilentSync, 5000);
    window.addEventListener("sharebite:notifications-changed", onManualChanged);
    window.addEventListener("sharebite:notification", onSilentSync);
    window.addEventListener("focus", onSilentSync);
    return () => {
      controller.abort();
      if (spinTimer.current !== null) {
        window.clearTimeout(spinTimer.current);
        spinTimer.current = null;
      }
      window.clearInterval(timer);
      window.removeEventListener("sharebite:notifications-changed", onManualChanged);
      window.removeEventListener("sharebite:notification", onSilentSync);
      window.removeEventListener("focus", onSilentSync);
    };
  }, [sessionId]);
  const current = sessionId && snapshot?.sessionId === sessionId ? snapshot : undefined;
  const refresh = useCallback(() => {
    window.dispatchEvent(new Event("sharebite:notifications-changed"));
  }, []);
  return { notifications: current?.notifications || [], loading: status === "loading" || Boolean(sessionId && !current), refreshing, error: current?.error || "", refresh, markRead: markRealNotificationRead, markAllRead: markAllRealNotificationsRead };
}
