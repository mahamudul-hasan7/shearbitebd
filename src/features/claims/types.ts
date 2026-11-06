import { ClaimStatus } from "@/lib/constants/statuses";

export type ClaimFilter = "ALL" | ClaimStatus.RESERVED | ClaimStatus.ASSIGNED | ClaimStatus.PICKED_UP | ClaimStatus.DELIVERED | ClaimStatus.DISTRIBUTED | ClaimStatus.EXPIRED;

export const CLAIM_FILTERS: ReadonlyArray<{ value: ClaimFilter; label: string; labelBn: string }> = [
  { value: "ALL", label: "All", labelBn: "সব ক্লেইম" },
  { value: ClaimStatus.RESERVED, label: "Reserved", labelBn: "সংরক্ষিত" },
  { value: ClaimStatus.ASSIGNED, label: "Assigned", labelBn: "ভলান্টিয়ার নির্ধারিত" },
  { value: ClaimStatus.PICKED_UP, label: "Picked up", labelBn: "সংগ্রহ সম্পন্ন (ট্রানজিটে)" },
  { value: ClaimStatus.DELIVERED, label: "Delivered", labelBn: "ডেলিভারি প্রাপ্ত" },
  { value: ClaimStatus.DISTRIBUTED, label: "Distributed", labelBn: "বিতরণ সম্পন্ন" },
  { value: ClaimStatus.EXPIRED, label: "Expired", labelBn: "মেয়াদোত্তীর্ণ" },
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
