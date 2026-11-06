export interface MetroZoneBenchmark {
  zoneNameBn: string;
  zoneNameEn: string;
  activeCafeterias: number;
  partnerNgos: number;
  avgPickupResponseMinutes: number;
  monthlyMealsRescued: number;
  wasteReductionRate: number;
}

export const DHAKA_METRO_BENCHMARKS: MetroZoneBenchmark[] = [
  {
    zoneNameBn: "বাড্ডা ও আফতাবনগর (UIU জোন)",
    zoneNameEn: "Badda & Aftabnagar",
    activeCafeterias: 14,
    partnerNgos: 8,
    avgPickupResponseMinutes: 18,
    monthlyMealsRescued: 4820,
    wasteReductionRate: 94.6
  },
  {
    zoneNameBn: "গুলশান ও বনানী ক্লাস্টার",
    zoneNameEn: "Gulshan & Banani",
    activeCafeterias: 22,
    partnerNgos: 12,
    avgPickupResponseMinutes: 24,
    monthlyMealsRescued: 7950,
    wasteReductionRate: 96.2
  },
  {
    zoneNameBn: "ধানমন্ডি ও লালমাটিয়া",
    zoneNameEn: "Dhanmondi",
    activeCafeterias: 18,
    partnerNgos: 9,
    avgPickupResponseMinutes: 21,
    monthlyMealsRescued: 5610,
    wasteReductionRate: 92.8
  },
  {
    zoneNameBn: "মিরপুর ও পল্লবী",
    zoneNameEn: "Mirpur",
    activeCafeterias: 16,
    partnerNgos: 11,
    avgPickupResponseMinutes: 26,
    monthlyMealsRescued: 6240,
    wasteReductionRate: 91.5
  }
];
