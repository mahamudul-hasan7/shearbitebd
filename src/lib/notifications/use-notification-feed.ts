"use client";

import { useEffect, useState } from "react";
import { useMockAuth } from "@/features/auth/mock-auth";
import { fetchRealNotifications, markAllRealNotificationsRead, markRealNotificationRead, type RealNotification } from "./real-notification-client";

export function useNotificationFeed() {
  const { session, status } = useMockAuth();
  const sessionId = session?.id;
  const [snapshot, setSnapshot] = useState<{ sessionId: string; notifications: RealNotification[]; error: string }>();
  useEffect(() => {
    if (!sessionId) return;
    const controller = new AbortController();
    let revision = 0;
    const load = () => {
      const current = ++revision;
      void fetchRealNotifications(undefined, undefined, controller.signal).then(({ notifications }) => {
        if (!controller.signal.aborted && current === revision) setSnapshot({ sessionId, notifications, error: "" });
      }).catch(() => {
        if (!controller.signal.aborted && current === revision) setSnapshot((previous) => ({ sessionId, notifications: previous?.sessionId === sessionId ? previous.notifications : [], error: "Notifications could not load. Please retry." }));
      });
    };
    load();
    const timer = window.setInterval(load, 5000);
    window.addEventListener("sharebite:notifications-changed", load);
    window.addEventListener("sharebite:notification", load);
    window.addEventListener("focus", load);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener("sharebite:notifications-changed", load); window.removeEventListener("sharebite:notification", load); window.removeEventListener("focus", load); };
  }, [sessionId]);
  const current = sessionId && snapshot?.sessionId === sessionId ? snapshot : undefined;
  const refresh = () => window.dispatchEvent(new Event("sharebite:notifications-changed"));
  return { notifications: current?.notifications || [], loading: status === "loading" || Boolean(sessionId && !current), error: current?.error || "", refresh, markRead: markRealNotificationRead, markAllRead: markAllRealNotificationsRead };
}
