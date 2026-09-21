import { UserRole } from "@/lib/constants/roles";
import { ClaimStatus, DonationStatus } from "@/lib/constants/statuses";
import { createMockId, MockApiError, simulateRequest, type MockServiceOptions } from "@/services/shared";
import { mockAppStore } from "@/store/mock-app-store";
import type { DeliveryFoodCondition, DeliveryReceipt, ViewerContext } from "@/types/domain";

export interface ConfirmDeliveryInput {
  actualQuantity: number;
  foodCondition: DeliveryFoodCondition;
  quantityMismatchConfirmed: boolean;
  verificationMethod: DeliveryReceipt["verificationMethod"];
  fallbackCode?: string;
  notes?: string;
  photoNames: string[];
}

function cloneReceipt(receipt: DeliveryReceipt) {
  return { ...receipt, photoNames: [...receipt.photoNames] };
}

function fallbackCode(token?: string) {
  const digits = token?.replace(/\D/g, "").slice(-6);
  return digits?.padStart(6, "0") ?? "000000";
}

export const deliveryService = {
  getByClaimId(claimId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<DeliveryReceipt | undefined> {
    return simulateRequest(() => {
      const state = mockAppStore.getSnapshot();
      const claim = state.claims.find((item) => item.id === claimId);
      if (!claim) throw new MockApiError({ code: "NOT_FOUND", message: "Claim not found.", status: 404, retryable: false });
      if (viewer.role !== UserRole.ADMIN && viewer.ngoProfileId !== claim.ngoProfileId) {
        throw new MockApiError({ code: "FORBIDDEN", message: "Only the claiming NGO can view this receipt.", status: 403, retryable: false });
      }
      const receipt = state.deliveryReceipts.find((item) => item.claimId === claimId);
      return receipt ? cloneReceipt(receipt) : undefined;
    }, options);
  },

  confirm(claimId: string, input: ConfirmDeliveryInput, viewer: ViewerContext, options?: MockServiceOptions): Promise<DeliveryReceipt> {
    return simulateRequest(() => {
      if (!Number.isFinite(input.actualQuantity) || input.actualQuantity <= 0) {
        throw new MockApiError({ code: "VALIDATION_ERROR", message: "Enter the received quantity.", status: 422, retryable: false, fieldErrors: { actualQuantity: "Quantity received must be positive." } });
      }
      if (input.photoNames.length > 5) {
        throw new MockApiError({ code: "VALIDATION_ERROR", message: "Select no more than five delivery photos.", status: 422, retryable: false, fieldErrors: { photoNames: "Select up to five photos." } });
      }

      let created: DeliveryReceipt | undefined;
      mockAppStore.update((state) => {
        const claim = state.claims.find((item) => item.id === claimId);
        if (!claim) throw new MockApiError({ code: "NOT_FOUND", message: "Claim not found.", status: 404, retryable: false });
        if (viewer.role !== UserRole.ADMIN && viewer.ngoProfileId !== claim.ngoProfileId) {
          throw new MockApiError({ code: "FORBIDDEN", message: "Only the claiming NGO can confirm this delivery.", status: 403, retryable: false });
        }
        if (claim.status !== ClaimStatus.PICKED_UP) {
          throw new MockApiError({ code: "CONFLICT", message: "Delivery confirmation requires a picked-up claim.", status: 409, retryable: false });
        }
        if (state.deliveryReceipts.some((item) => item.claimId === claimId)) {
          throw new MockApiError({ code: "CONFLICT", message: "A delivery receipt already exists for this claim.", status: 409, retryable: false });
        }
        const donation = state.donations.find((item) => item.id === claim.donationId);
        if (!donation) throw new MockApiError({ code: "NOT_FOUND", message: "Claim donation not found.", status: 404, retryable: false });
        const mismatch = input.actualQuantity !== donation.quantity.value;
        if (mismatch && !input.quantityMismatchConfirmed) {
          throw new MockApiError({ code: "VALIDATION_ERROR", message: "Confirm the quantity mismatch or report an incident.", status: 422, retryable: false, fieldErrors: { quantityMismatchConfirmed: "Confirm that the received quantity differs from the expected quantity." } });
        }
        if (input.verificationMethod === "FALLBACK_CODE" && input.fallbackCode?.trim() !== fallbackCode(claim.deliveryVerificationToken)) {
          throw new MockApiError({ code: "VALIDATION_ERROR", message: "The mock fallback code does not match.", status: 422, retryable: false, fieldErrors: { fallbackCode: "Enter the six-digit delivery code shown for this claim." } });
        }

        const now = new Date().toISOString();
        const receipt: DeliveryReceipt = {
          id: createMockId("receipt"),
          claimId,
          ngoProfileId: claim.ngoProfileId,
          expectedQuantity: donation.quantity.value,
          actualQuantity: input.actualQuantity,
          quantityUnit: donation.quantity.unit,
          foodCondition: input.foodCondition,
          quantityMismatchConfirmed: mismatch && input.quantityMismatchConfirmed,
          distributionBlocked: input.foodCondition === "DAMAGED_POOR",
          verificationMethod: input.verificationMethod,
          notes: input.notes?.trim() || undefined,
          photoNames: [...input.photoNames],
          receivedAt: now,
          createdAt: now,
        };
        created = receipt;
        return {
          ...state,
          deliveryReceipts: [receipt, ...state.deliveryReceipts],
          claims: state.claims.map((item) => item.id === claimId ? { ...item, status: ClaimStatus.DELIVERED, deliveredAt: now, updatedAt: now } : item),
          donations: state.donations.map((item) => item.id === donation.id ? { ...item, status: DonationStatus.DELIVERED, updatedAt: now } : item),
        };
      });
      if (!created) throw new MockApiError({ code: "MOCK_FAILURE", message: "The delivery receipt was not created.", status: 500, retryable: true });
      return cloneReceipt(created);
    }, options);
  },
};
