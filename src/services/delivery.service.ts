import type { DeliveryFoodCondition, DeliveryReceipt, ViewerContext } from "@/types/domain";
import type { MockServiceOptions } from "@/services/shared";
import { apiRequest } from "@/services/http";

export interface ConfirmDeliveryInput {
  actualQuantity: number;
  foodCondition: DeliveryFoodCondition;
  quantityMismatchConfirmed: boolean;
  verificationMethod: DeliveryReceipt["verificationMethod"];
  notes?: string;
  photoNames: string[];
  photoUrls?: string[];
}
export const deliveryService = {
  async getByClaimId(claimId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<DeliveryReceipt | undefined> {
    void viewer;
    return (await apiRequest<{ receipt: DeliveryReceipt | null }>(`/api/deliveries?claimId=${encodeURIComponent(claimId)}`, { signal: options?.signal })).receipt || undefined;
  },
  async confirm(claimId: string, input: ConfirmDeliveryInput, viewer: ViewerContext, options?: MockServiceOptions): Promise<DeliveryReceipt> {
    void viewer;
    return (await apiRequest<{ receipt: DeliveryReceipt }>("/api/deliveries", { method: "POST", signal: options?.signal, body: JSON.stringify({ claimId, input }) })).receipt;
  },
};
