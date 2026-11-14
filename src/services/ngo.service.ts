import { type MockServiceOptions } from "@/services/shared";
import { apiRequest } from "@/services/http";
import type { Address, NGOProfile } from "@/types/domain";

export interface NGOImpactSummary {
  peopleHelped: number;
  completedRescues: number;
  recentMealsDistributed: number;
  recentFoodRescuedKg: number;
  estimatedCo2PreventedKg: number;
}

export interface NGORecentActivity {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
}

export interface NGODirectoryItem {
  profile: NGOProfile;
  addresses: Address[];
  impact: NGOImpactSummary;
  recentActivities: NGORecentActivity[];
}

export const ngoService = {
  async listVerified(options?: MockServiceOptions): Promise<NGODirectoryItem[]> {
    return (await apiRequest<{ ngos: NGODirectoryItem[] }>("/api/ngos", { signal: options?.signal })).ngos;
  },
  async getById(id: string, options?: MockServiceOptions): Promise<NGODirectoryItem> {
    return (await apiRequest<{ ngo: NGODirectoryItem }>(`/api/ngos?id=${encodeURIComponent(id)}`, { signal: options?.signal })).ngo;
  },
};
