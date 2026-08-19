import { ClaimStatus } from "@/lib/constants/statuses";

export type ClaimFilter = "ALL" | ClaimStatus.RESERVED | ClaimStatus.ASSIGNED | ClaimStatus.PICKED_UP | ClaimStatus.DELIVERED | ClaimStatus.DISTRIBUTED | ClaimStatus.EXPIRED;

export const CLAIM_FILTERS: ReadonlyArray<{ value: ClaimFilter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: ClaimStatus.RESERVED, label: "Reserved" },
  { value: ClaimStatus.ASSIGNED, label: "Assigned" },
  { value: ClaimStatus.PICKED_UP, label: "Picked up" },
  { value: ClaimStatus.DELIVERED, label: "Delivered" },
  { value: ClaimStatus.DISTRIBUTED, label: "Distributed" },
  { value: ClaimStatus.EXPIRED, label: "Expired" },
];

export const ACTIVE_CLAIM_STATUSES = new Set<ClaimStatus>([
  ClaimStatus.RESERVED,
  ClaimStatus.ASSIGNED,
  ClaimStatus.PICKED_UP,
  ClaimStatus.DELIVERED,
]);

export const COMPLETED_CLAIM_STATUSES = new Set<ClaimStatus>([
  ClaimStatus.DISTRIBUTED,
]);
