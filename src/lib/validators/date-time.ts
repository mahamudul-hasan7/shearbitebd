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

  if (preparedAt === undefined) errors.preparationTime = "সঠিক রান্নার তারিখ ও সময় নির্বাচন করুন।";
  if (deadline === undefined) errors.safePickupDeadline = "নিরাপদ ব্যবহারের শেষ সময় দিন।";
  if (pickupStart === undefined) errors.pickupWindowStart = "পিকআপ শুরুর সময় নির্ধারণ করুন।";
  if (pickupEnd === undefined) errors.pickupWindowEnd = "পিকআপ শেষের সময় নির্ধারণ করুন।";

  if (preparedAt !== undefined && deadline !== undefined && preparedAt > deadline) {
    errors.safePickupDeadline = "নিরাপদ মেয়াদ অবশ্যই রান্নার সময়ের পরে হতে হবে।";
  }
  if (deadline !== undefined && requireFutureDeadline && deadline <= now) {
    errors.safePickupDeadline = "নিরাপদ মেয়াদ অবশ্যই ভবিষ্যতের সময় হতে হবে।";
  }
  if (pickupStart !== undefined && pickupEnd !== undefined && pickupStart > pickupEnd) {
    errors.pickupWindowEnd = "পিকআপ শেষের সময় অবশ্যই শুরুর সময়ের পরে হতে হবে।";
  }
  if (pickupEnd !== undefined && deadline !== undefined && pickupEnd > deadline) {
    errors.pickupWindowEnd = "পিকআপের শেষ সময় অবশ্যই খাবারের নিরাপদ মেয়াদের (Safe Until) সমান বা আগে হতে হবে।";
  }

  return errors;
}

export function isValidDateRange(start: string, end: string) {
  const startTime = toTimestamp(start);
  const endTime = toTimestamp(end);
  return startTime !== undefined && endTime !== undefined && startTime <= endTime;
}
