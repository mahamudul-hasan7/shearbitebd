import { PriorityLevel } from "@/lib/constants/domain";
import { UserRole } from "@/lib/constants/roles";
import { RequestStatus } from "@/lib/constants/statuses";
import { canTransitionRequest } from "@/lib/status-transitions";
import { mockAppStore } from "@/store/mock-app-store";
import type { FoodRequest, ViewerContext } from "@/types/domain";
import { createMockId, MockApiError, simulateRequest, type MockServiceOptions } from "@/services/shared";

export interface RequestListQuery {
  ngoProfileId?: string;
  statuses?: RequestStatus[];
  search?: string;
}

export type CreateFoodRequestInput = Omit<FoodRequest, "id" | "createdAt" | "updatedAt" | "status"> & {
  status?: RequestStatus;
};

function validateRequest(input: CreateFoodRequestInput) {
  const fieldErrors: Record<string, string> = {};
  if (!input.title.trim()) fieldErrors.title = "Enter a request title.";
  if (input.peopleToServe <= 0) fieldErrors.peopleToServe = "People to serve must be positive.";
  if (input.mealsNeeded <= 0) fieldErrors.mealsNeeded = "Meals needed must be positive.";
  const neededBy = Date.parse(input.neededBy);
  if (!Number.isFinite(neededBy) || neededBy <= Date.now()) fieldErrors.neededBy = "The requested time must be in the future.";
  if ((input.priority === PriorityLevel.HIGH || input.priority === PriorityLevel.URGENT) && !input.priorityReason?.trim()) {
    fieldErrors.priorityReason = "Explain why this request has high priority.";
  }
  if (Object.keys(fieldErrors).length) {
    throw new MockApiError({ code: "VALIDATION_ERROR", message: "Correct the food request details.", status: 422, retryable: false, fieldErrors });
  }
}

function cloneRequest(request: FoodRequest) {
  return { ...request, categories: [...request.categories], dietaryTypes: [...request.dietaryTypes], allergensOrRestrictions: [...request.allergensOrRestrictions] };
}

export const requestService = {
  list(query: RequestListQuery = {}, options?: MockServiceOptions): Promise<FoodRequest[]> {
    return simulateRequest(() => {
      const search = query.search?.trim().toLowerCase();
      return mockAppStore.getSnapshot().requests
        .filter((request) => {
          if (query.ngoProfileId && request.ngoProfileId !== query.ngoProfileId) return false;
          if (query.statuses?.length && !query.statuses.includes(request.status)) return false;
          if (search && !`${request.title} ${request.purpose} ${request.recipientType}`.toLowerCase().includes(search)) return false;
          return true;
        })
        .sort((left, right) => Date.parse(left.neededBy) - Date.parse(right.neededBy))
        .map(cloneRequest);
    }, options);
  },

  getById(id: string, options?: MockServiceOptions): Promise<FoodRequest> {
    return simulateRequest(() => {
      const request = mockAppStore.getSnapshot().requests.find((item) => item.id === id);
      if (!request) throw new MockApiError({ code: "NOT_FOUND", message: "Food request not found.", status: 404, retryable: false });
      return cloneRequest(request);
    }, options);
  },

  create(input: CreateFoodRequestInput, viewer: ViewerContext, options?: MockServiceOptions): Promise<FoodRequest> {
    return simulateRequest(() => {
      if (!viewer.ngoProfileId || viewer.ngoProfileId !== input.ngoProfileId) {
        throw new MockApiError({ code: "FORBIDDEN", message: "You can create requests only for your own NGO profile.", status: 403, retryable: false });
      }
      validateRequest(input);
      const now = new Date().toISOString();
      const request: FoodRequest = { ...input, id: createMockId("request"), status: input.status ?? RequestStatus.DRAFT, createdAt: now, updatedAt: now };
      mockAppStore.update((state) => ({ ...state, requests: [request, ...state.requests] }));
      return cloneRequest(request);
    }, options);
  },

  transitionStatus(id: string, nextStatus: RequestStatus, viewer: ViewerContext, options?: MockServiceOptions): Promise<FoodRequest> {
    return simulateRequest(() => {
      let result: FoodRequest | undefined;
      mockAppStore.update((state) => {
        const request = state.requests.find((item) => item.id === id);
        if (!request) throw new MockApiError({ code: "NOT_FOUND", message: "Food request not found.", status: 404, retryable: false });
        if (viewer.ngoProfileId !== request.ngoProfileId && viewer.role !== UserRole.ADMIN) {
          throw new MockApiError({ code: "FORBIDDEN", message: "You cannot update this food request.", status: 403, retryable: false });
        }
        if (!canTransitionRequest(request.status, nextStatus)) {
          throw new MockApiError({ code: "CONFLICT", message: `Request cannot move from ${request.status} to ${nextStatus}.`, status: 409, retryable: false });
        }
        const nextRequest = { ...request, status: nextStatus, updatedAt: new Date().toISOString() };
        result = nextRequest;
        return { ...state, requests: state.requests.map((item) => item.id === id ? nextRequest : item) };
      });
      if (!result) throw new MockApiError({ code: "NOT_FOUND", message: "Food request not found.", status: 404, retryable: false });
      return cloneRequest(result);
    }, options);
  },
};
