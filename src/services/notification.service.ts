import type { Notification, ViewerContext } from "@/types/domain";
import type { MockServiceOptions } from "@/services/shared";
import { apiRequest } from "@/services/http";

export const notificationService = {
  async listForUser(userId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<Notification[]> {
    void userId; void viewer;
    return (await apiRequest<{ notifications: Notification[] }>("/api/notifications", { signal: options?.signal })).notifications;
  },
  async markRead(id: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<Notification> {
    void viewer;
    return (await apiRequest<{ notification: Notification }>("/api/notifications", { method: "PATCH", signal: options?.signal, body: JSON.stringify({ id, read: true }) })).notification;
  },
  async markUnread(id: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<Notification> {
    void viewer;
    return (await apiRequest<{ notification: Notification }>("/api/notifications", { method: "PATCH", signal: options?.signal, body: JSON.stringify({ id, read: false }) })).notification;
  },
  async markAllRead(userId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<Notification[]> {
    await apiRequest("/api/notifications/read-all", { method: "POST", signal: options?.signal });
    return this.listForUser(userId, viewer, options);
  },
};
