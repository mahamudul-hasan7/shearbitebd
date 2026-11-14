"use client";

import { apiRequest } from "@/services/http";
export interface RealNotification { id: string; userId?: string; role?: string; type: string; title: string; message: string; href: string; read: boolean; createdAt: string; }

let channel: BroadcastChannel | undefined;
function connect() {
  if (typeof window === "undefined" || channel || !("BroadcastChannel" in window)) return;
  try {
    channel = new BroadcastChannel("sharebite_notifications_channel");
    channel.onmessage = () => window.dispatchEvent(new Event("sharebite:notifications-changed"));
  } catch {}
}
function announce() {
  connect();
  window.dispatchEvent(new Event("sharebite:notifications-changed"));
  try { channel?.postMessage({ type: "changed" }); } catch {}
}
export async function fetchRealNotifications(role?: string, userId?: string, signal?: AbortSignal): Promise<{ notifications: RealNotification[]; unreadCount: number }> {
  void role; void userId; connect();
  return apiRequest("/api/notifications", { signal });
}
export async function markRealNotificationRead(id: string) {
  await apiRequest("/api/notifications", { method: "PATCH", body: JSON.stringify({ id }) });
  announce();
}
export async function markAllRealNotificationsRead(role?: string, userId?: string) {
  void role; void userId;
  await apiRequest("/api/notifications/read-all", { method: "POST" });
  announce();
}
