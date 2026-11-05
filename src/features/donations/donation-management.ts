import { DONATION_LIFECYCLE, DonationStatus } from "@/lib/constants/statuses";

export type DonationTabKey =
  | "all"
  | "active"
  | "completed"
  | "archived"
  | "matched"
  | "scheduled"
  | "cancelled"
  | "expired";

export const DONATION_TABS: ReadonlyArray<{
  key: DonationTabKey;
  label: string;
  statuses?: readonly DonationStatus[];
}> = [
  { key: "all", label: "সকল অনুদান" },
  {
    key: "active",
    label: "চলমান ও পিকআপ",
    statuses: [
      DonationStatus.DRAFT,
      DonationStatus.PUBLISHED,
      DonationStatus.AVAILABLE,
      DonationStatus.RESERVED,
      DonationStatus.ASSIGNED,
      DonationStatus.PICKED_UP,
      DonationStatus.DELIVERED,
    ],
  },
  {
    key: "completed",
    label: "বিতরণ সম্পন্ন",
    statuses: [DonationStatus.DISTRIBUTED],
  },
  {
    key: "archived",
    label: "আর্কাইভ / অন্যান্য",
    statuses: [
      DonationStatus.CANCELLED,
      DonationStatus.EXPIRED,
      DonationStatus.DISPUTED,
    ],
  },
];

const EDITABLE_STATUSES = new Set<DonationStatus>([
  DonationStatus.DRAFT,
  DonationStatus.PUBLISHED,
  DonationStatus.AVAILABLE,
  DonationStatus.RESERVED,
  DonationStatus.ASSIGNED,
]);

const CANCELLABLE_STATUSES = new Set<DonationStatus>([
  DonationStatus.DRAFT,
  DonationStatus.PUBLISHED,
  DonationStatus.AVAILABLE,
  DonationStatus.RESERVED,
  DonationStatus.ASSIGNED,
]);

const CLOSED_STATUSES = new Set<DonationStatus>([
  DonationStatus.DISTRIBUTED,
  DonationStatus.EXPIRED,
  DonationStatus.CANCELLED,
]);

export function matchesDonationTab(status: DonationStatus, tab: DonationTabKey) {
  const statuses = DONATION_TABS.find((item) => item.key === tab)?.statuses;
  return !statuses || statuses.includes(status);
}

export function canEditDonation(status: DonationStatus) {
  return EDITABLE_STATUSES.has(status);
}

export function canCancelDonation(status: DonationStatus) {
  return CANCELLABLE_STATUSES.has(status);
}

export function isClosedDonation(status: DonationStatus) {
  return CLOSED_STATUSES.has(status);
}

export function donationLifecycleProgress(status: DonationStatus) {
  const index = DONATION_LIFECYCLE.indexOf(status);
  if (index < 0) return 100;
  return Math.round((index / (DONATION_LIFECYCLE.length - 1)) * 100);
}
