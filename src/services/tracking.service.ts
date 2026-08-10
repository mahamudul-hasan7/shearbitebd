import { UserRole } from "@/lib/constants/roles";
import type { TransportMethod } from "@/lib/constants/domain";
import { createDonationView } from "@/lib/permissions/permissions";
import { MockApiError, simulateRequest, type MockServiceOptions } from "@/services/shared";
import { mockAppStore } from "@/store/mock-app-store";
import type { Claim, DonationView, IncidentReport, ViewerContext } from "@/types/domain";

export interface TrackingNGOSummary {
  id: string;
  name: string;
  rating?: number;
  completedRescues: number;
  serviceAreas: string[];
  contactName?: string;
  contactPhone?: string;
}

export interface TrackingVolunteerSummary {
  id: string;
  name: string;
  phone?: string;
  transportMethod: TransportMethod;
  completedRescues: number;
}

export interface DonationTrackingData {
  donation: DonationView;
  claim?: Claim;
  receiverNgo?: TrackingNGOSummary;
  volunteer?: TrackingVolunteerSummary;
  incidents: IncidentReport[];
}

export const trackingService = {
  getByDonationId(donationId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<DonationTrackingData> {
    return simulateRequest(() => {
      const state = mockAppStore.getSnapshot();
      const donation = state.donations.find((item) => item.id === donationId);
      if (!donation) throw new MockApiError({ code: "NOT_FOUND", message: "Donation not found.", status: 404, retryable: false });
      const claim = state.claims.filter((item) => item.donationId === donationId).sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))[0];
      const canView = viewer.role === UserRole.ADMIN || viewer.donorProfileId === donation.donorProfileId || (claim !== undefined && (viewer.ngoProfileId === claim.ngoProfileId || viewer.volunteerProfileId === claim.volunteerProfileId));
      if (!canView) throw new MockApiError({ code: "FORBIDDEN", message: "You are not authorized to track this donation.", status: 403, retryable: false });

      const ngo = claim ? state.ngoProfiles.find((item) => item.id === claim.ngoProfileId) : undefined;
      const ngoUser = ngo ? state.users.find((item) => item.id === ngo.authorizedContactUserId) : undefined;
      const volunteer = claim?.volunteerProfileId ? state.volunteerProfiles.find((item) => item.id === claim.volunteerProfileId) : undefined;
      const volunteerUser = volunteer ? state.users.find((item) => item.id === volunteer.userId) : undefined;
      const claimIncidents = claim ? state.incidentReports.filter((incident) => incident.claimId === claim.id) : [];

      return {
        donation: createDonationView(donation, viewer, state.claims, state.addresses),
        claim: claim ? { ...claim } : undefined,
        receiverNgo: ngo ? {
          id: ngo.id,
          name: ngo.organizationName,
          rating: ngo.rating,
          completedRescues: ngo.completedRescues,
          serviceAreas: [...ngo.serviceAreas],
          contactName: ngoUser?.displayName,
          contactPhone: ngoUser?.phone,
        } : undefined,
        volunteer: volunteer && volunteerUser ? {
          id: volunteer.id,
          name: volunteerUser.displayName,
          phone: volunteerUser.phone,
          transportMethod: volunteer.transportMethod,
          completedRescues: volunteer.completedRescues,
        } : undefined,
        incidents: claimIncidents.sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)).map((incident) => ({ ...incident, evidenceUrls: [...incident.evidenceUrls] })),
      };
    }, options);
  },
};
