import { IncidentStatus, IncidentType, PriorityLevel } from "@/lib/constants/domain";
import { UserRole } from "@/lib/constants/roles";
import { ClaimStatus, DonationStatus } from "@/lib/constants/statuses";
import { canTransitionClaim, canTransitionDonation } from "@/lib/status-transitions";
import { createMockId, MockApiError, simulateRequest, type MockServiceOptions } from "@/services/shared";
import { mockAppStore } from "@/store/mock-app-store";
import type { IncidentReport, ViewerContext } from "@/types/domain";

export interface CreateDonationIncidentInput {
  type: IncidentType;
  severity: PriorityLevel;
  description: string;
  preferredContactMethod: IncidentReport["preferredContactMethod"];
}

function cloneIncident(incident: IncidentReport) {
  return { ...incident, evidenceUrls: [...incident.evidenceUrls] };
}

export const incidentService = {
  listForDonation(donationId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<IncidentReport[]> {
    return simulateRequest(() => {
      const state = mockAppStore.getSnapshot();
      const donation = state.donations.find((item) => item.id === donationId);
      if (!donation) throw new MockApiError({ code: "NOT_FOUND", message: "Donation not found.", status: 404, retryable: false });
      const claimIds = new Set(state.claims.filter((claim) => claim.donationId === donationId).map((claim) => claim.id));
      const canView = viewer.role === UserRole.ADMIN || viewer.donorProfileId === donation.donorProfileId || state.claims.some((claim) => claim.donationId === donationId && (viewer.ngoProfileId === claim.ngoProfileId || viewer.volunteerProfileId === claim.volunteerProfileId));
      if (!canView) throw new MockApiError({ code: "FORBIDDEN", message: "You cannot view reports for this donation.", status: 403, retryable: false });
      return state.incidentReports.filter((incident) => claimIds.has(incident.claimId)).sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)).map(cloneIncident);
    }, options);
  },

  createForDonation(donationId: string, input: CreateDonationIncidentInput, viewer: ViewerContext, options?: MockServiceOptions): Promise<IncidentReport> {
    return simulateRequest(() => {
      const description = input.description.trim();
      if (description.length < 12) {
        throw new MockApiError({ code: "VALIDATION_ERROR", message: "Describe the issue clearly.", status: 422, retryable: false, fieldErrors: { description: "Enter at least 12 characters." } });
      }
      if (!viewer.userId) throw new MockApiError({ code: "FORBIDDEN", message: "A signed-in user is required.", status: 403, retryable: false });
      const reporterUserId = viewer.userId;

      let created: IncidentReport | undefined;
      mockAppStore.update((state) => {
        const donation = state.donations.find((item) => item.id === donationId);
        if (!donation) throw new MockApiError({ code: "NOT_FOUND", message: "Donation not found.", status: 404, retryable: false });
        const claim = state.claims.filter((item) => item.donationId === donationId).sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))[0];
        if (!claim) throw new MockApiError({ code: "CONFLICT", message: "Issue reporting becomes available after an NGO claim exists.", status: 409, retryable: false });
        const canReport = viewer.role === UserRole.ADMIN || viewer.donorProfileId === donation.donorProfileId || viewer.ngoProfileId === claim.ngoProfileId || viewer.volunteerProfileId === claim.volunteerProfileId;
        if (!canReport) throw new MockApiError({ code: "FORBIDDEN", message: "You are not part of this rescue.", status: 403, retryable: false });
        if (!canTransitionDonation(donation.status, DonationStatus.DISPUTED) || !canTransitionClaim(claim.status, ClaimStatus.DISPUTED)) {
          throw new MockApiError({ code: "CONFLICT", message: "This closed rescue can no longer be reported from the donation screen.", status: 409, retryable: false });
        }

        const now = new Date().toISOString();
        const incident: IncidentReport = {
          id: createMockId("incident"),
          claimId: claim.id,
          reportedByUserId: reporterUserId,
          type: input.type,
          severity: input.severity,
          description,
          evidenceUrls: [],
          preferredContactMethod: input.preferredContactMethod,
          status: IncidentStatus.OPEN,
          createdAt: now,
          updatedAt: now,
        };
        created = incident;
        return {
          ...state,
          donations: state.donations.map((item) => item.id === donationId ? { ...item, status: DonationStatus.DISPUTED, updatedAt: now } : item),
          claims: state.claims.map((item) => item.id === claim.id ? { ...item, status: ClaimStatus.DISPUTED, updatedAt: now } : item),
          incidentReports: [incident, ...state.incidentReports],
        };
      });
      if (!created) throw new MockApiError({ code: "MOCK_FAILURE", message: "The mock issue report was not created.", status: 500, retryable: true });
      return cloneIncident(created);
    }, options);
  },
};
