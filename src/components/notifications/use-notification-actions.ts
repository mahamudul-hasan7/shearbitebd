"use client";

import { useRef, useState } from "react";
import { markAllRealNotificationsRead, markRealNotificationRead } from "@/lib/notifications/real-notification-client";

export function useNotificationActions() {
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState("");
  const failedId = useRef<string | undefined>(undefined);
  const locked = useRef(false);
  async function markRead(id?: string) {
    if (locked.current) return;
    locked.current = true;
    setBusy(id || "all"); setError(""); failedId.current = id;
    try { if (id) await markRealNotificationRead(id); else await markAllRealNotificationsRead(); }
    catch { setError("Read status could not be saved. Please retry."); }
    finally { locked.current = false; setBusy(undefined); }
  }
  return { busy, error, markRead, retry: () => { void markRead(failedId.current); } };
}
