export interface DonationTimeErrors {
  preparationTime?: string;
  safePickupDeadline?: string;
  pickupWindowStart?: string;
  pickupWindowEnd?: string;
}

function toTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

export function validateDonationTimes({
  preparationTime,
  safePickupDeadline,
  pickupWindowStart,
  pickupWindowEnd,
  now = Date.now(),
  requireFutureDeadline = true,
}: {
  preparationTime: string;
  safePickupDeadline: string;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  now?: number;
  requireFutureDeadline?: boolean;
}): DonationTimeErrors {
  const errors: DonationTimeErrors = {};
  const preparedAt = toTimestamp(preparationTime);
  const deadline = toTimestamp(safePickupDeadline);
  const pickupStart = toTimestamp(pickupWindowStart);
  const pickupEnd = toTimestamp(pickupWindowEnd);

  if (preparedAt === undefined) errors.preparationTime = "Enter a valid preparation date and time.";
  if (deadline === undefined) errors.safePickupDeadline = "Enter a valid safe pickup deadline.";
  if (pickupStart === undefined) errors.pickupWindowStart = "Enter a valid pickup start time.";
  if (pickupEnd === undefined) errors.pickupWindowEnd = "Enter a valid pickup end time.";

  if (preparedAt !== undefined && deadline !== undefined && preparedAt > deadline) {
    errors.safePickupDeadline = "Safe pickup deadline must be after the preparation time.";
  }
  if (deadline !== undefined && requireFutureDeadline && deadline <= now) {
    errors.safePickupDeadline = "Safe pickup deadline must be in the future.";
  }
  if (pickupStart !== undefined && pickupEnd !== undefined && pickupStart > pickupEnd) {
    errors.pickupWindowEnd = "Pickup end time must be after the pickup start time.";
  }
  if (pickupEnd !== undefined && deadline !== undefined && pickupEnd > deadline) {
    errors.pickupWindowEnd = "Pickup time cannot be later than the safe pickup deadline.";
  }

  return errors;
}

export function isValidDateRange(start: string, end: string) {
  const startTime = toTimestamp(start);
  const endTime = toTimestamp(end);
  return startTime !== undefined && endTime !== undefined && startTime <= endTime;
}
