import { selectTrackingClaim } from "@/lib/rescue-next-step";
import { incidentService } from "@/services/incident.service";
import type { TransportMethod } from "@/lib/constants/domain";
import type { MockServiceOptions } from "@/services/shared";
import { apiRequest } from "@/services/http";
import type { Address, Claim, DonationView, IncidentReport, ViewerContext } from "@/types/domain";
import type { ClaimCoordinationDetails } from "@/services/claim.service";
export interface TrackingNGOSummary { id: string; name: string; rating?: number; completedRescues: number; serviceAreas: string[]; contactName?: string; contactPhone?: string; }
export interface TrackingVolunteerSummary { id: string; name: string; phone?: string; transportMethod: TransportMethod; completedRescues: number; }
export interface DonationTrackingData { deliveryAddress?: Address; donation: DonationView; claim?: Claim; receiverNgo?: TrackingNGOSummary; volunteer?: TrackingVolunteerSummary; incidents: IncidentReport[]; }
export const trackingService = {
  async getByDonationId(id: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<DonationTrackingData> {
    void viewer;
    const [data, claims, incidents] = await Promise.all([
      apiRequest<{ donation: DonationView }>(`/api/donations?id=${encodeURIComponent(id)}`, { signal: options?.signal }),
      apiRequest<{ claims: Claim[] }>(`/api/claims?donationId=${encodeURIComponent(id)}`, { signal: options?.signal }),
      incidentService.listForDonation(id, viewer, options),
    ]);
    let claim = selectTrackingClaim(claims.claims, data.donation.status);
    let details: (ClaimCoordinationDetails & { receiverNgo?: TrackingNGOSummary }) | undefined;
    if (claim) details = (await apiRequest<{ details: ClaimCoordinationDetails & { receiverNgo?: TrackingNGOSummary } }>(`/api/claims?id=${encodeURIComponent(claim.id)}`, { signal: options?.signal })).details;
    if (details) claim = details.claim;
    return { donation: details?.donation || data.donation, claim, deliveryAddress: details?.deliveryAddress, receiverNgo: details?.receiverNgo, incidents, volunteer: details?.volunteer ? { id: details.volunteer.id, name: details.volunteer.displayName, phone: details.volunteer.phone, transportMethod: details.volunteer.transportMethod, completedRescues: details.volunteer.completedRescues } : undefined };
  },
};
