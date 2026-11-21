"use client";

import { useEffect } from "react";
import { useMockAuth } from "@/features/auth/mock-auth";
import { useVolunteerStore } from "./volunteer-store";

export function VolunteerDutySync() {
  const { session } = useMockAuth();
  const { resetForUser, refreshDuty } = useVolunteerStore();
  const userId = session?.role === "VOLUNTEER" ? session.id : undefined;
  useEffect(() => {
    resetForUser(userId);
    if (!userId) return;
    const refresh = () => { if (document.visibilityState === "visible") void refreshDuty().catch(() => {}); };
    refresh();
    const timer = window.setInterval(refresh, 15_000);
    window.addEventListener("focus", refresh);
    window.addEventListener("sharebite:verification-changed", refresh);
    document.addEventListener("visibilitychange", refresh);
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("sharebite-volunteer-duty") : undefined;
    if (channel) channel.onmessage = (event) => { if (event.data?.userId === userId) refresh(); };
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("sharebite:verification-changed", refresh);
      document.removeEventListener("visibilitychange", refresh);
      channel?.close();
      resetForUser(undefined);
    };
  }, [userId, resetForUser, refreshDuty]);
  return null;
}
