import { QuantityUnit } from "@/lib/constants/domain";
import { UserRole } from "@/lib/constants/roles";
import { ClaimStatus, DonationStatus } from "@/lib/constants/statuses";
import { createMockId, MockApiError, simulateRequest, type MockServiceOptions } from "@/services/shared";
import { mockAppStore } from "@/store/mock-app-store";
import type { DistributionRecord, ImpactRecord, ViewerContext } from "@/types/domain";

export interface CreateDistributionInput {
  beneficiariesServed: number;
  mealsDistributed: number;
  adultsServed?: number;
  childrenServed?: number;
  distributedAt: string;
  addressId: string;
  notes?: string;
  photoNames: string[];
  beneficiaryConsentConfirmed: boolean;
}

function cloneRecord(record: DistributionRecord) {
  return { ...record, photoUrls: [...record.photoUrls] };
}

export const distributionService = {
  getByClaimId(claimId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<DistributionRecord | undefined> {
    return simulateRequest(() => {
      const state = mockAppStore.getSnapshot();
      const claim = state.claims.find((item) => item.id === claimId);
      if (!claim) throw new MockApiError({ code: "NOT_FOUND", message: "Claim not found.", status: 404, retryable: false });
      if (viewer.role !== UserRole.ADMIN && viewer.ngoProfileId !== claim.ngoProfileId) {
        throw new MockApiError({ code: "FORBIDDEN", message: "Only the claiming NGO can view this distribution.", status: 403, retryable: false });
      }
      const record = state.distributionRecords.find((item) => item.claimId === claimId);
      return record ? cloneRecord(record) : undefined;
    }, options);
  },

  create(claimId: string, input: CreateDistributionInput, viewer: ViewerContext, options?: MockServiceOptions): Promise<DistributionRecord> {
    return simulateRequest(() => {
      const fieldErrors: Record<string, string> = {};
      if (!Number.isInteger(input.beneficiariesServed) || input.beneficiariesServed <= 0) fieldErrors.beneficiariesServed = "Enter a positive whole number.";
      if (!Number.isInteger(input.mealsDistributed) || input.mealsDistributed <= 0) fieldErrors.mealsDistributed = "Enter a positive whole number.";
      const adults = input.adultsServed ?? 0;
      const children = input.childrenServed ?? 0;
      if (adults < 0 || children < 0 || !Number.isInteger(adults) || !Number.isInteger(children)) fieldErrors.breakdown = "Optional beneficiary counts must be whole numbers.";
      if (adults + children > input.beneficiariesServed) fieldErrors.breakdown = "Adult and child counts cannot exceed total beneficiaries.";
      const distributedAt = Date.parse(input.distributedAt);
      if (!Number.isFinite(distributedAt) || distributedAt > Date.now()) fieldErrors.distributedAt = "Distribution time cannot be in the future.";
      if (!input.addressId) fieldErrors.addressId = "Select the distribution location.";
      if (!input.beneficiaryConsentConfirmed) fieldErrors.beneficiaryConsentConfirmed = "Confirm the beneficiary privacy and consent notice.";
      if (input.photoNames.length > 5) fieldErrors.photoNames = "Select up to five photos.";
      if (Object.keys(fieldErrors).length) throw new MockApiError({ code: "VALIDATION_ERROR", message: "Correct the distribution details.", status: 422, retryable: false, fieldErrors });

      let created: DistributionRecord | undefined;
      mockAppStore.update((state) => {
        const claim = state.claims.find((item) => item.id === claimId);
        if (!claim) throw new MockApiError({ code: "NOT_FOUND", message: "Claim not found.", status: 404, retryable: false });
        if (viewer.role !== UserRole.ADMIN && viewer.ngoProfileId !== claim.ngoProfileId) {
          throw new MockApiError({ code: "FORBIDDEN", message: "Only the claiming NGO can record this distribution.", status: 403, retryable: false });
        }
        if (claim.status !== ClaimStatus.DELIVERED) throw new MockApiError({ code: "CONFLICT", message: "Distribution requires a delivered claim.", status: 409, retryable: false });
        if (state.distributionRecords.some((item) => item.claimId === claimId)) throw new MockApiError({ code: "CONFLICT", message: "A distribution record already exists for this claim.", status: 409, retryable: false });
        const receipt = state.deliveryReceipts.find((item) => item.claimId === claimId);
        if (!receipt) throw new MockApiError({ code: "CONFLICT", message: "Confirm delivery before recording distribution.", status: 409, retryable: false });
        if (receipt.distributionBlocked) throw new MockApiError({ code: "CONFLICT", message: "Distribution is blocked because the received food was marked damaged or poor.", status: 409, retryable: false });
        const donation = state.donations.find((item) => item.id === claim.donationId);
        if (!donation) throw new MockApiError({ code: "NOT_FOUND", message: "Claim donation not found.", status: 404, retryable: false });
        const ngo = state.ngoProfiles.find((item) => item.id === claim.ngoProfileId);
        if (!ngo?.addressIds.includes(input.addressId)) throw new MockApiError({ code: "FORBIDDEN", message: "Select an address owned by the claiming NGO.", status: 403, retryable: false });

        const now = new Date().toISOString();
        const record: DistributionRecord = {
          id: createMockId("distribution"), claimId, ngoProfileId: claim.ngoProfileId,
          beneficiariesServed: input.beneficiariesServed, mealsDistributed: input.mealsDistributed,
          adultsServed: input.adultsServed, childrenServed: input.childrenServed,
          distributedAt: new Date(distributedAt).toISOString(), addressId: input.addressId,
          notes: input.notes?.trim() || undefined,
          photoUrls: input.photoNames.map((name) => `/mock/distribution/${encodeURIComponent(name)}`),
          beneficiaryConsentConfirmed: true, createdAt: now,
        };
        const foodWeightKg = donation.quantity.unit === QuantityUnit.KILOGRAMS ? receipt.actualQuantity : Math.max(0.5, input.mealsDistributed * 0.5);
        const impact: ImpactRecord = {
          id: createMockId("impact"), claimId, donorProfileId: donation.donorProfileId, ngoProfileId: claim.ngoProfileId,
          recordedAt: record.distributedAt, mealsRescued: input.mealsDistributed, foodWeightKg,
          beneficiariesServed: input.beneficiariesServed, estimatedCo2PreventedKg: foodWeightKg * 2.5,
          estimatedWaterSavedLitres: foodWeightKg * 250,
          estimateMethodology: "Frontend estimate using 2.5 kg CO2e and 250 litres of water per kilogram of rescued food; not a measured environmental result.",
        };
        created = record;
        return {
          ...state,
          distributionRecords: [record, ...state.distributionRecords], impactRecords: [impact, ...state.impactRecords],
          claims: state.claims.map((item) => item.id === claimId ? { ...item, status: ClaimStatus.DISTRIBUTED, distributedAt: now, updatedAt: now } : item),
          donations: state.donations.map((item) => item.id === donation.id ? { ...item, status: DonationStatus.DISTRIBUTED, updatedAt: now } : item),
          ngoProfiles: state.ngoProfiles.map((item) => item.id === claim.ngoProfileId ? { ...item, completedRescues: item.completedRescues + 1, peopleHelped: item.peopleHelped + input.beneficiariesServed, updatedAt: now } : item),
        };
      });
      if (!created) throw new MockApiError({ code: "MOCK_FAILURE", message: "The distribution record was not created.", status: 500, retryable: true });
      return cloneRecord(created);
    }, options);
  },
};
