import { UserRole } from "@/lib/constants/roles";
import { mockAppStore } from "@/store/mock-app-store";
import type { UserPreferences, ViewerContext } from "@/types/domain";
import { MockApiError, simulateRequest, type MockServiceOptions } from "@/services/shared";

export interface SupportRequestInput {
  userId: string;
  category: "DONATION" | "PICKUP" | "ACCOUNT" | "TECHNICAL" | "OTHER";
  message: string;
}

function requireOwner(userId: string, viewer: ViewerContext) {
  if (viewer.userId !== userId && viewer.role !== UserRole.ADMIN) {
    throw new MockApiError({ code: "FORBIDDEN", message: "You cannot update these account settings.", status: 403, retryable: false });
  }
}

export const accountService = {
  getPreferences(userId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<UserPreferences> {
    return simulateRequest(() => {
      requireOwner(userId, viewer);
      const preferences = mockAppStore.getSnapshot().userPreferences.find((item) => item.userId === userId);
      if (!preferences) throw new MockApiError({ code: "NOT_FOUND", message: "Account preferences were not found.", status: 404, retryable: false });
      return { ...preferences };
    }, options);
  },

  updatePreferences(userId: string, input: Partial<Omit<UserPreferences, "userId" | "updatedAt">>, viewer: ViewerContext, options?: MockServiceOptions): Promise<UserPreferences> {
    return simulateRequest(() => {
      requireOwner(userId, viewer);
      const current = mockAppStore.getSnapshot().userPreferences.find((item) => item.userId === userId);
      if (!current) throw new MockApiError({ code: "NOT_FOUND", message: "Account preferences were not found.", status: 404, retryable: false });
      const updated = { ...current, ...input, userId, updatedAt: new Date().toISOString() };
      mockAppStore.update((state) => ({ ...state, userPreferences: state.userPreferences.map((item) => item.userId === userId ? updated : item) }));
      return { ...updated };
    }, options);
  },

  submitSupportRequest(input: SupportRequestInput, viewer: ViewerContext, options?: MockServiceOptions): Promise<{ reference: string; submittedAt: string }> {
    return simulateRequest(() => {
      requireOwner(input.userId, viewer);
      if (input.message.trim().length < 20) {
        throw new MockApiError({ code: "VALIDATION_ERROR", message: "Tell us a little more so the support team can help.", status: 422, retryable: false, fieldErrors: { message: "Use at least 20 characters." } });
      }
      return { reference: `SB-${Date.now().toString().slice(-6)}`, submittedAt: new Date().toISOString() };
    }, options);
  },
};
