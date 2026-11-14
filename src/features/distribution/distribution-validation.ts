export interface DistributionFormValues {
  beneficiaries: string;
  meals: string;
  adults: string;
  children: string;
  distributedAt: string;
  addressId: string;
  consent: boolean;
}

export type DistributionFormErrors = Partial<Record<"beneficiariesServed" | "mealsDistributed" | "breakdown" | "distributedAt" | "addressId" | "photoNames" | "beneficiaryConsentConfirmed", string>>;

export function localDistributionTime(timestamp: number) {
  const date = new Date(timestamp);
  return new Date(timestamp - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 23);
}

export function validateDistributionForm(values: DistributionFormValues, { now, receivedAt, mealCapacity }: { now: number; receivedAt: string; mealCapacity: number }): DistributionFormErrors {
  const errors: DistributionFormErrors = {};
  const people = Number(values.beneficiaries), meals = Number(values.meals);
  if (!values.beneficiaries.trim() || !Number.isInteger(people) || people <= 0 || people > 1_000_000) errors.beneficiariesServed = "Enter a positive whole number.";
  if (!values.meals.trim() || !Number.isInteger(meals) || meals <= 0 || meals > 1_000_000) errors.mealsDistributed = "Enter a positive whole number.";
  else if (meals > mealCapacity) errors.mealsDistributed = "Distribution cannot exceed the received share of the donor's declared meals.";
  if (!errors.beneficiariesServed && !errors.mealsDistributed && people > meals) errors.beneficiariesServed = "Record at least one meal per beneficiary.";
  for (const value of [values.adults, values.children]) {
    if (value.trim() && (!Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) > 1_000_000)) errors.breakdown = "Use non-negative whole-number beneficiary counts.";
  }
  if (!errors.breakdown && Number(values.adults || 0) + Number(values.children || 0) > people) errors.breakdown = "Adult and child counts cannot exceed total people served.";
  const time = Date.parse(values.distributedAt);
  if (!values.distributedAt || !Number.isFinite(time)) errors.distributedAt = "Enter a valid distribution date and time.";
  else if (time > now) errors.distributedAt = "Distribution time cannot be in the future.";
  else if (time < Date.parse(receivedAt)) errors.distributedAt = "Choose a time on or after the NGO receipt.";
  if (!values.addressId) errors.addressId = "Select a distribution address owned by your NGO.";
  if (!values.consent) errors.beneficiaryConsentConfirmed = "Consent confirmation is required.";
  return errors;
}
