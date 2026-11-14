import type { ProfileBundle } from "@/services";
import type { Claim, DonationView, FoodRequest, Notification } from "@/types/domain";
import type { AppStatus } from "@/lib/constants/statuses";

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
  status?: AppStatus;
  meals?: number;
  beneficiaries?: number;
}

export interface NGODashboardData {
  profile: ProfileBundle;
  stats: {
    availableNearby: number | null;
    hasLocation: boolean;
    unmappedDonations: number;
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
