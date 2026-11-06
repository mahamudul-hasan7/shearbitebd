import type { Notification } from "@/types/domain";

export type NotificationGroupKey = "today" | "yesterday" | "earlier";

export function groupNotificationsByDate(notifications: Notification[]): Record<NotificationGroupKey, Notification[]> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

  const grouped: Record<NotificationGroupKey, Notification[]> = {
    today: [],
    yesterday: [],
    earlier: []
  };

  for (const notif of notifications) {
    const time = Date.parse(notif.createdAt);
    if (time >= startOfToday) {
      grouped.today.push(notif);
    } else if (time >= startOfYesterday) {
      grouped.yesterday.push(notif);
    } else {
      grouped.earlier.push(notif);
    }
  }

  return grouped;
}

export function countUnreadNotifications(notifications: Notification[]): number {
  return notifications.filter((item) => !item.readAt).length;
}
