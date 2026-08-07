import { ClaimStatus, DonationStatus, RequestStatus } from "@/lib/constants/statuses";

export const DONATION_TRANSITIONS = {
  [DonationStatus.DRAFT]: [DonationStatus.PUBLISHED, DonationStatus.CANCELLED],
  [DonationStatus.PUBLISHED]: [DonationStatus.AVAILABLE, DonationStatus.CANCELLED, DonationStatus.EXPIRED],
  [DonationStatus.AVAILABLE]: [DonationStatus.RESERVED, DonationStatus.CANCELLED, DonationStatus.EXPIRED],
  [DonationStatus.RESERVED]: [DonationStatus.ASSIGNED, DonationStatus.AVAILABLE, DonationStatus.CANCELLED, DonationStatus.EXPIRED, DonationStatus.DISPUTED],
  [DonationStatus.ASSIGNED]: [DonationStatus.PICKED_UP, DonationStatus.CANCELLED, DonationStatus.EXPIRED, DonationStatus.DISPUTED],
  [DonationStatus.PICKED_UP]: [DonationStatus.DELIVERED, DonationStatus.DISPUTED],
  [DonationStatus.DELIVERED]: [DonationStatus.DISTRIBUTED, DonationStatus.DISPUTED],
  [DonationStatus.DISTRIBUTED]: [],
  [DonationStatus.EXPIRED]: [],
  [DonationStatus.CANCELLED]: [],
  [DonationStatus.DISPUTED]: [],
} satisfies Record<DonationStatus, readonly DonationStatus[]>;

export const CLAIM_TRANSITIONS = {
  [ClaimStatus.RESERVED]: [ClaimStatus.ASSIGNED, ClaimStatus.CANCELLED, ClaimStatus.EXPIRED, ClaimStatus.DISPUTED],
  [ClaimStatus.ASSIGNED]: [ClaimStatus.PICKED_UP, ClaimStatus.CANCELLED, ClaimStatus.EXPIRED, ClaimStatus.DISPUTED],
  [ClaimStatus.PICKED_UP]: [ClaimStatus.DELIVERED, ClaimStatus.DISPUTED],
  [ClaimStatus.DELIVERED]: [ClaimStatus.DISTRIBUTED, ClaimStatus.DISPUTED],
  [ClaimStatus.DISTRIBUTED]: [],
  [ClaimStatus.CANCELLED]: [],
  [ClaimStatus.EXPIRED]: [],
  [ClaimStatus.DISPUTED]: [],
} satisfies Record<ClaimStatus, readonly ClaimStatus[]>;

export const REQUEST_TRANSITIONS = {
  [RequestStatus.DRAFT]: [RequestStatus.PENDING_REVIEW, RequestStatus.CANCELLED],
  [RequestStatus.PENDING_REVIEW]: [RequestStatus.FINDING_MATCH, RequestStatus.CANCELLED, RequestStatus.EXPIRED],
  [RequestStatus.FINDING_MATCH]: [RequestStatus.MATCHED, RequestStatus.CANCELLED, RequestStatus.EXPIRED],
  [RequestStatus.MATCHED]: [RequestStatus.FULFILLED, RequestStatus.CANCELLED, RequestStatus.EXPIRED],
  [RequestStatus.FULFILLED]: [],
  [RequestStatus.CANCELLED]: [],
  [RequestStatus.EXPIRED]: [],
} satisfies Record<RequestStatus, readonly RequestStatus[]>;

function canTransition<TStatus extends string>(
  transitions: Record<TStatus, readonly TStatus[]>,
  current: TStatus,
  next: TStatus,
) {
  return transitions[current].includes(next);
}

export function canTransitionDonation(current: DonationStatus, next: DonationStatus) {
  return canTransition(DONATION_TRANSITIONS, current, next);
}

export function canTransitionClaim(current: ClaimStatus, next: ClaimStatus) {
  return canTransition(CLAIM_TRANSITIONS, current, next);
}

export function canTransitionRequest(current: RequestStatus, next: RequestStatus) {
  return canTransition(REQUEST_TRANSITIONS, current, next);
}

export function getDonationTransitions(status: DonationStatus) {
  return DONATION_TRANSITIONS[status];
}

export function getClaimTransitions(status: ClaimStatus) {
  return CLAIM_TRANSITIONS[status];
}

export function getRequestTransitions(status: RequestStatus) {
  return REQUEST_TRANSITIONS[status];
}
