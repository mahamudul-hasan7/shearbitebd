"use client";

export interface RealNotification {
  id: string;
  userId?: string;
  role?: string;
  type: string;
  title: string;
  message: string;
  href: string;
  read: boolean;
  createdAt: string;
}

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    broadcastChannel = new BroadcastChannel("sharebite_notifications_channel");
    broadcastChannel.onmessage = (event) => {
      if (event.data?.type === "sharebite:notification" && event.data.notification) {
        window.dispatchEvent(
          new CustomEvent("sharebite:notification", { detail: event.data.notification })
        );
      } else if (event.data?.type === "sharebite:notification-read-all") {
        window.dispatchEvent(new CustomEvent("sharebite:notification-read-all"));
      } else if (event.data?.type === "sharebite:notification-read" && event.data.id) {
        window.dispatchEvent(
          new CustomEvent("sharebite:notification-read", { detail: { id: event.data.id } })
        );
      }
    };
  } catch {
    // Channel initialization fallback
  }
}

export async function fetchRealNotifications(
  role?: string,
  userId?: string
): Promise<{ notifications: RealNotification[]; unreadCount: number }> {
  try {
    const params = new URLSearchParams();
    if (role) params.set("role", role.toUpperCase());
    if (userId) params.set("userId", userId);

    const res = await fetch(`/api/notifications?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return { notifications: [], unreadCount: 0 };
    const data = await res.json();
    return {
      notifications: data.notifications || [],
      unreadCount: data.unreadCount || 0,
    };
  } catch {
    return { notifications: [], unreadCount: 0 };
  }
}

export async function createRealNotification(input: {
  title: string;
  message: string;
  href?: string;
  type?: string;
  role?: string;
  userId?: string;
}): Promise<RealNotification | null> {
  try {
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) return null;
    const data = await res.json();

    if (typeof window !== "undefined" && data.notification) {
      window.dispatchEvent(
        new CustomEvent("sharebite:notification", { detail: data.notification })
      );
      try {
        broadcastChannel?.postMessage({
          type: "sharebite:notification",
          notification: data.notification,
        });
      } catch {
        // BroadcastChannel optional
      }
    }

    return data.notification;
  } catch {
    return null;
  }
}

export async function markRealNotificationRead(id: string) {
  try {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("sharebite:notification-read", { detail: { id } })
      );
      try {
        broadcastChannel?.postMessage({
          type: "sharebite:notification-read",
          id,
        });
      } catch {
        // BroadcastChannel optional
      }
    }
  } catch {
    // ignore
  }
}

export async function markAllRealNotificationsRead(role?: string, userId?: string) {
  try {
    const params = new URLSearchParams();
    if (role) params.set("role", role.toUpperCase());
    if (userId) params.set("userId", userId);

    await fetch(`/api/notifications/read-all?${params.toString()}`, { method: "POST" });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sharebite:notification-read-all"));
      try {
        broadcastChannel?.postMessage({
          type: "sharebite:notification-read-all",
        });
      } catch {
        // BroadcastChannel optional
      }
    }
  } catch {
    // ignore
  }
}
