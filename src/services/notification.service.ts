import { UserRole } from "@/lib/constants/roles";
import { mockAppStore } from "@/store/mock-app-store";
import type { Notification, ViewerContext } from "@/types/domain";
import { MockApiError, simulateRequest, type MockServiceOptions } from "@/services/shared";

function cloneNotification(notification: Notification) {
  return { ...notification };
}

export const notificationService = {
  listForUser(userId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<Notification[]> {
    return simulateRequest(() => {
      if (viewer.userId !== userId && viewer.role !== UserRole.ADMIN) {
        throw new MockApiError({ code: "FORBIDDEN", message: "Notifications are private to the account owner.", status: 403, retryable: false });
      }
      return mockAppStore.getSnapshot().notifications
        .filter((notification) => notification.userId === userId)
        .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
        .map(cloneNotification);
    }, options);
  },

  markRead(id: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<Notification> {
    return simulateRequest(() => {
      let result: Notification | undefined;
      mockAppStore.update((state) => {
        const notification = state.notifications.find((item) => item.id === id);
        if (!notification) throw new MockApiError({ code: "NOT_FOUND", message: "Notification not found.", status: 404, retryable: false });
        if (viewer.userId !== notification.userId && viewer.role !== UserRole.ADMIN) {
          throw new MockApiError({ code: "FORBIDDEN", message: "You cannot update this notification.", status: 403, retryable: false });
        }
        const updatedNotification = { ...notification, readAt: notification.readAt ?? new Date().toISOString() };
        result = updatedNotification;
        return { ...state, notifications: state.notifications.map((item) => item.id === id ? updatedNotification : item) };
      });
      if (!result) throw new MockApiError({ code: "NOT_FOUND", message: "Notification not found.", status: 404, retryable: false });
      return cloneNotification(result);
    }, options);
  },

  markUnread(id: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<Notification> {
    return simulateRequest(() => {
      let result: Notification | undefined;
      mockAppStore.update((state) => {
        const notification = state.notifications.find((item) => item.id === id);
        if (!notification) throw new MockApiError({ code: "NOT_FOUND", message: "Notification not found.", status: 404, retryable: false });
        if (viewer.userId !== notification.userId && viewer.role !== UserRole.ADMIN) {
          throw new MockApiError({ code: "FORBIDDEN", message: "You cannot update this notification.", status: 403, retryable: false });
        }
        const updatedNotification = { ...notification, readAt: undefined };
        result = updatedNotification;
        return { ...state, notifications: state.notifications.map((item) => item.id === id ? updatedNotification : item) };
      });
      if (!result) throw new MockApiError({ code: "NOT_FOUND", message: "Notification not found.", status: 404, retryable: false });
      return cloneNotification(result);
    }, options);
  },

  markAllRead(userId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<Notification[]> {
    return simulateRequest(() => {
      if (viewer.userId !== userId && viewer.role !== UserRole.ADMIN) {
        throw new MockApiError({ code: "FORBIDDEN", message: "You cannot update these notifications.", status: 403, retryable: false });
      }
      const readAt = new Date().toISOString();
      mockAppStore.update((state) => ({
        ...state,
        notifications: state.notifications.map((notification) => notification.userId === userId ? { ...notification, readAt: notification.readAt ?? readAt } : notification),
      }));
      return mockAppStore.getSnapshot().notifications.filter((notification) => notification.userId === userId).map(cloneNotification);
    }, options);
  },
};
