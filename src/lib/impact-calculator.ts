/**
 * UNEP (United Nations Environment Programme) Food Waste Impact Factors
 * Standard conversion formulas for surplus food rescue diversion.
 */

export interface EcologicalImpactMetrics {
  mealsRescued: number;
  peopleFed: number;
  co2PreventedKg: number;
  waterConservedLiters: number;
}

export function calculateEcologicalImpact(surplusMealsCount: number): EcologicalImpactMetrics {
  const meals = Math.max(0, surplusMealsCount);
  return {
    mealsRescued: meals,
    peopleFed: Math.round(meals * 1.25),
    co2PreventedKg: Math.round(meals * 2.4 * 10) / 10,
    waterConservedLiters: Math.round(meals * 160)
  };
}

export function formatImpactKgBn(kg: number): string {
  return new Intl.NumberFormat("bn-BD", { maximumFractionDigits: 1 }).format(kg) + " কেজি";
}

export function formatImpactLitersBn(liters: number): string {
  return new Intl.NumberFormat("bn-BD").format(liters) + " লিটার";
}
