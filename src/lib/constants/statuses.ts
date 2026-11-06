export enum DonationStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  ASSIGNED = "ASSIGNED",
  PICKED_UP = "PICKED_UP",
  DELIVERED = "DELIVERED",
  DISTRIBUTED = "DISTRIBUTED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
  DISPUTED = "DISPUTED",
}

export enum ClaimStatus {
  RESERVED = "RESERVED",
  ASSIGNED = "ASSIGNED",
  PICKED_UP = "PICKED_UP",
  DELIVERED = "DELIVERED",
  DISTRIBUTED = "DISTRIBUTED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  DISPUTED = "DISPUTED",
}

export enum RequestStatus {
  DRAFT = "DRAFT",
  PENDING_REVIEW = "PENDING_REVIEW",
  FINDING_MATCH = "FINDING_MATCH",
  MATCHED = "MATCHED",
  FULFILLED = "FULFILLED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export type AppStatus = DonationStatus | ClaimStatus | RequestStatus;
export type StatusTone = "neutral" | "brand" | "accent" | "success" | "warning" | "danger" | "info";

export const STATUS_META = {
  DRAFT: { label: "Draft", tone: "neutral" },
  PUBLISHED: { label: "Published", tone: "info" },
  AVAILABLE: { label: "Available", tone: "success" },
  RESERVED: { label: "Reserved", tone: "warning" },
  ASSIGNED: { label: "Assigned", tone: "info" },
  PICKED_UP: { label: "Picked up", tone: "brand" },
  DELIVERED: { label: "Delivered", tone: "success" },
  DISTRIBUTED: { label: "Distributed", tone: "success" },
  EXPIRED: { label: "Expired", tone: "neutral" },
  CANCELLED: { label: "Cancelled", tone: "danger" },
  DISPUTED: { label: "Disputed", tone: "danger" },
  PENDING_REVIEW: { label: "Pending review", tone: "warning" },
  FINDING_MATCH: { label: "Finding match", tone: "accent" },
  MATCHED: { label: "Matched", tone: "brand" },
  FULFILLED: { label: "Fulfilled", tone: "success" },
} satisfies Record<AppStatus, { label: string; tone: StatusTone }>;

export const STATUS_META_BN: Record<AppStatus, { label: string; tone: StatusTone }> = {
  DRAFT: { label: "খসড়া", tone: "neutral" },
  PUBLISHED: { label: "প্রকাশিত", tone: "info" },
  AVAILABLE: { label: "উদ্ধারযোগ্য", tone: "success" },
  RESERVED: { label: "সংরক্ষিত", tone: "warning" },
  ASSIGNED: { label: "ভলান্টিয়ার নির্ধারিত", tone: "info" },
  PICKED_UP: { label: "সংগ্রহ সম্পন্ন (চলমান)", tone: "brand" },
  DELIVERED: { label: "ডেলিভারি প্রাপ্ত", tone: "success" },
  DISTRIBUTED: { label: "বিতরণ সম্পন্ন", tone: "success" },
  EXPIRED: { label: "মেয়াদোত্তীর্ণ", tone: "neutral" },
  CANCELLED: { label: "বাতিলকৃত", tone: "danger" },
  DISPUTED: { label: "বিরোধ পর্যালোচনায়", tone: "danger" },
  PENDING_REVIEW: { label: "পর্যালোচনাধীন", tone: "warning" },
  FINDING_MATCH: { label: "ম্যাচিং চলছে", tone: "accent" },
  MATCHED: { label: "ম্যাচ হয়েছে", tone: "brand" },
  FULFILLED: { label: "সম্পন্ন হয়েছে", tone: "success" },
};

export const DONATION_LIFECYCLE: readonly DonationStatus[] = [
  DonationStatus.DRAFT,
  DonationStatus.PUBLISHED,
  DonationStatus.AVAILABLE,
  DonationStatus.RESERVED,
  DonationStatus.ASSIGNED,
  DonationStatus.PICKED_UP,
  DonationStatus.DELIVERED,
  DonationStatus.DISTRIBUTED,
];

export const CLAIM_LIFECYCLE: readonly ClaimStatus[] = [
  ClaimStatus.RESERVED,
  ClaimStatus.ASSIGNED,
  ClaimStatus.PICKED_UP,
  ClaimStatus.DELIVERED,
  ClaimStatus.DISTRIBUTED,
];

export const REQUEST_LIFECYCLE: readonly RequestStatus[] = [
  RequestStatus.DRAFT,
  RequestStatus.PENDING_REVIEW,
  RequestStatus.FINDING_MATCH,
  RequestStatus.MATCHED,
  RequestStatus.FULFILLED,
];
