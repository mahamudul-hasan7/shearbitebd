/**
 * Bangladesh Food Safety Authority (BFSA) Thermal Window Standards
 * Specifies strict shelf-life decay thresholds based on preparation timestamps.
 */

export const THERMAL_SAFETY_LIMITS = {
  HOT_COOKED_HOURS: 4,      // Cooked rice, biryani, curries must be consumed within 4h
  COLD_STORAGE_HOURS: 24,   // Refrigerated items kept under 4 degrees Celsius
  BAKERY_HOURS: 36,         // Fresh bread, buns, baked goods
  PRODUCE_HOURS: 48,        // Fresh fruits and raw vegetables
  PACKAGED_GROCERIES_DAYS: 30
} as const;

export function calculateRemainingSafeMinutes(preparedAtIso: string, maxHours: number): number {
  const preparedTime = Date.parse(preparedAtIso);
  const expirationTime = preparedTime + maxHours * 60 * 60 * 1000;
  const remainingMs = expirationTime - Date.now();
  return Math.max(0, Math.floor(remainingMs / (60 * 1000)));
}
