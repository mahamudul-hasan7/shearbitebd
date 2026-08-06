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
