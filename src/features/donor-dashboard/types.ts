import type { DonationView, ImpactRecord } from "@/types/domain";

export interface DashboardActivity {
  id: string;
  kind: "donation" | "notification" | "impact";
  title: string;
  description: string;
  timestamp: string;
  href?: string;
}

export interface SupportedNGOSummary {
  id: string;
  name: string;
  serviceAreas: string[];
  completedRescues: number;
  mealsSupported: number;
  lastSupportedAt: string;
}

export interface DonorDashboardData {
  profile: {
    name: string;
    email: string;
    initials: string;
    description: string;
  };
  stats: {
    totalDonations: number;
    activeDonations: number;
    mealsRescued: number;
    ngosHelped: number;
    donorScore: number;
    donorScoreDescription: string;
  };
  donations: DonationView[];
  activeDonation?: DonationView;
  activities: DashboardActivity[];
  supportedNgos: SupportedNGOSummary[];
  impactRecords: ImpactRecord[];
  unreadNotifications: number;
}
