import { DonationStatus } from "../../lib/constants/statuses";
import type { DonationView } from "../../types/domain";

const priority: Partial<Record<DonationStatus, number>> = {
  DISPUTED: 0, PICKED_UP: 1, ASSIGNED: 2, RESERVED: 3, DELIVERED: 4, AVAILABLE: 5, PUBLISHED: 5,
};

/** Choose the handover needing attention before a newer unclaimed food post. */
export function selectActiveDonation<T extends Pick<DonationView, "status" | "safePickupDeadline">>(donations: T[]): T | undefined {
  const deadline = (item: T) => Number.isFinite(Date.parse(item.safePickupDeadline)) ? Date.parse(item.safePickupDeadline) : Infinity;
  return donations.filter((item) => priority[item.status] !== undefined).sort((a, b) =>
    priority[a.status]! - priority[b.status]! || deadline(a) - deadline(b)
  )[0];
}
