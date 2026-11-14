import type { IncidentType, PriorityLevel } from "@/lib/constants/domain";
import type { IncidentReport, ViewerContext } from "@/types/domain";
import type { MockServiceOptions } from "@/services/shared";
import { apiRequest } from "@/services/http";

export interface CreateDonationIncidentInput {
  type: IncidentType;
  severity: PriorityLevel;
  description: string;
  preferredContactMethod: IncidentReport["preferredContactMethod"];
  evidenceUrls?: string[];
  submissionKey?: string;
}
export const incidentService = {
  async listForClaim(claimId: string, options?: MockServiceOptions): Promise<IncidentReport[]> {
    return (await apiRequest<{ incidents: IncidentReport[] }>(`/api/incidents?claimId=${encodeURIComponent(claimId)}`, { signal: options?.signal })).incidents;
  },
  async listForDonation(donationId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<IncidentReport[]> {
    void viewer;
    return (await apiRequest<{ incidents: IncidentReport[] }>(`/api/incidents?donationId=${encodeURIComponent(donationId)}`, { signal: options?.signal })).incidents;
  },
  async createForClaim(claimId: string, input: CreateDonationIncidentInput): Promise<IncidentReport> {
    return (await apiRequest<{ incident: IncidentReport }>("/api/incidents", { method: "POST", body: JSON.stringify({ claimId, input: { ...input, submissionKey: input.submissionKey || crypto.randomUUID() } }) })).incident;
  },
  async createForDonation(donationId: string, input: CreateDonationIncidentInput, viewer: ViewerContext, options?: MockServiceOptions): Promise<IncidentReport> {
    void viewer;
    return (await apiRequest<{ incident: IncidentReport }>("/api/incidents", { method: "POST", signal: options?.signal, body: JSON.stringify({ donationId, input: { ...input, submissionKey: input.submissionKey || crypto.randomUUID() } }) })).incident;
  },
};
