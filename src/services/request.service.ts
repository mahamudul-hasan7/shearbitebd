import type { RequestStatus } from "@/lib/constants/statuses";
import type { DonationView, FoodRequest, ViewerContext } from "@/types/domain";
import type { MockServiceOptions } from "@/services/shared";
import { apiRequest } from "@/services/http";
export interface RequestListQuery { ngoProfileId?: string; statuses?: RequestStatus[]; search?: string; }
export type CreateFoodRequestInput = Omit<FoodRequest, "id" | "createdAt" | "updatedAt" | "status" | "mealsFulfilled" | "mealsReserved" | "remainingMeals" | "linkedClaims"> & { status?: RequestStatus; submissionKey?: string };
export type UpdateFoodRequestInput = Partial<Omit<CreateFoodRequestInput, "ngoProfileId" | "status" | "submissionKey">>;
export interface FoodRequestMatch { donation: DonationView; score: number; reasons: string[]; allergenReviewRequired: boolean; mealsToAllocate: number; }
export const requestService = {
  async list(query: RequestListQuery = {}, options?: MockServiceOptions): Promise<FoodRequest[]> {
    const { requests } = await apiRequest<{ requests: FoodRequest[] }>("/api/requests", { signal: options?.signal });
    const search = query.search?.trim().toLowerCase();
    return requests.filter((r) => (!query.statuses?.length || query.statuses.includes(r.status)) && (!search || (r.title + r.purpose + r.recipientType).toLowerCase().includes(search)));
  },
  async getById(id: string, options?: MockServiceOptions): Promise<FoodRequest> {
    return (await apiRequest<{ request: FoodRequest }>(`/api/requests?id=${encodeURIComponent(id)}`, { signal: options?.signal })).request;
  },
  async matches(id: string, options?: MockServiceOptions) {
    return apiRequest<{ request: FoodRequest; matches: FoodRequestMatch[] }>(`/api/requests?id=${encodeURIComponent(id)}&matches=true`, { signal: options?.signal });
  },
  async create(input: CreateFoodRequestInput, viewer: ViewerContext, options?: MockServiceOptions): Promise<FoodRequest> {
    void viewer;
    return (await apiRequest<{ request: FoodRequest }>("/api/requests", { method: "POST", signal: options?.signal, body: JSON.stringify({ ...input, submissionKey: input.submissionKey || crypto.randomUUID() }) })).request;
  },
  async update(id: string, input: UpdateFoodRequestInput, viewer: ViewerContext, options?: MockServiceOptions): Promise<FoodRequest> {
    void viewer; return (await apiRequest<{ request: FoodRequest }>("/api/requests", { method: "PATCH", signal: options?.signal, body: JSON.stringify({ id, action: "update", input }) })).request;
  },
  async transitionStatus(id: string, nextStatus: RequestStatus, viewer: ViewerContext, options?: MockServiceOptions): Promise<FoodRequest> {
    void viewer; return (await apiRequest<{ request: FoodRequest }>("/api/requests", { method: "PATCH", signal: options?.signal, body: JSON.stringify({ id, action: nextStatus === "CANCELLED" ? "cancel" : "unsupported" }) })).request;
  },
};
