import type { ProfileBundle } from "@/services";
import type { Claim, DonationView, FoodRequest, Notification } from "@/types/domain";

export interface NGOActiveClaim {
  claim: Claim;
  donation: DonationView;
}

export interface NGOActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  href?: string;
  kind: "CLAIM" | "NOTIFICATION" | "REQUEST" | "IMPACT";
}

export interface NGODashboardData {
  profile: ProfileBundle;
  stats: {
    availableNearby: number;
    activeClaims: number;
    mealsDistributed: number;
    beneficiariesServed: number;
  };
  recommendedDonation?: DonationView;
  recommendedMatchScore: number;
  activeClaims: NGOActiveClaim[];
  activities: NGOActivity[];
  requests: FoodRequest[];
  notifications: Notification[];
}
