import { FoodCategory } from "@/lib/constants/domain";
import { DonationStatus } from "@/lib/constants/statuses";
import type { Donation, DonationView, ViewerContext } from "@/types/domain";
import type { MockServiceOptions } from "@/services/shared";
import { apiRequest } from "@/services/http";

export interface DonationListQuery { viewer?: ViewerContext; donorProfileId?: string; statuses?: DonationStatus[]; categories?: FoodCategory[]; search?: string; }
export type CreateDonationInput = Omit<Donation, "id" | "createdAt" | "updatedAt" | "status"> & { status?: DonationStatus };
export interface UpdateDonationInput { title: string; description: string; quantity: Donation["quantity"]; safePickupDeadline: string; pickupWindowStart: string; pickupWindowEnd: string; specialInstructions?: string; }

export const donationService = {
  async list(query: DonationListQuery = {}, options?: MockServiceOptions): Promise<DonationView[]> {
    const { donations } = await apiRequest<{ donations: DonationView[] }>("/api/donations", { signal: options?.signal });
    const search = query.search?.trim().toLowerCase();
    return donations.filter((d) => (!query.statuses?.length || query.statuses.includes(d.status)) && (!query.categories?.length || query.categories.includes(d.category)) && (!search || (d.title + d.description + d.pickup.approximateArea).toLowerCase().includes(search)));
  },
  async getById(id: string, viewer: ViewerContext = {}, options?: MockServiceOptions): Promise<DonationView> {
    void viewer; return (await apiRequest<{ donation: DonationView }>(`/api/donations?id=${encodeURIComponent(id)}`, { signal: options?.signal })).donation;
  },
  async create(input: CreateDonationInput, viewer: ViewerContext, options?: MockServiceOptions): Promise<DonationView> {
    void viewer; return (await apiRequest<{ donation: DonationView }>("/api/donations", { method: "POST", signal: options?.signal, body: JSON.stringify(input) })).donation;
  },
  async update(id: string, input: UpdateDonationInput, viewer: ViewerContext, options?: MockServiceOptions): Promise<DonationView> {
    void viewer; return (await apiRequest<{ donation: DonationView }>("/api/donations", { method: "PATCH", signal: options?.signal, body: JSON.stringify({ id, action: "update", input }) })).donation;
  },
  async cancel(id: string, reason: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<DonationView> {
    void viewer; return (await apiRequest<{ donation: DonationView }>("/api/donations", { method: "PATCH", signal: options?.signal, body: JSON.stringify({ id, action: "cancel", reason }) })).donation;
  },
  async publishDraft(id: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<DonationView> {
    void viewer; return (await apiRequest<{ donation: DonationView }>("/api/donations", { method: "PATCH", signal: options?.signal, body: JSON.stringify({ id, action: "publish" }) })).donation;
  },
  async transitionStatus(id: string, status: DonationStatus, viewer: ViewerContext, options?: MockServiceOptions): Promise<DonationView> {
    void viewer; return (await apiRequest<{ donation: DonationView }>("/api/donations", { method: "PATCH", signal: options?.signal, body: JSON.stringify({ id, status }) })).donation;
  },
};
