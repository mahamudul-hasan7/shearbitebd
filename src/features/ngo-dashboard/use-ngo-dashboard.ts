"use client";

import { useEffect, useState } from "react";
import { FoodCategory } from "@/lib/constants/domain";
import { UserRole } from "@/lib/constants/roles";
import { ClaimStatus, DonationStatus, STATUS_META } from "@/lib/constants/statuses";
import { calculateUrgencyScore } from "@/lib/selectors/donation-selectors";
import { ROUTES } from "@/lib/routes";
import { asyncState, claimService, donationService, impactService, notificationService, profileService, requestService, toServiceError, type AsyncState } from "@/services";
import type { DonationView, ViewerContext } from "@/types/domain";
import type { NGOActivity, NGODashboardData } from "@/features/ngo-dashboard/types";

export const NGO_USER_ID = "user-ngo-hope";
export const NGO_PROFILE_ID = "ngo-hope";
export const NGO_VIEWER: ViewerContext = { userId: NGO_USER_ID, ngoProfileId: NGO_PROFILE_ID, role: UserRole.NGO };

const ACTIVE_CLAIMS = [ClaimStatus.RESERVED, ClaimStatus.ASSIGNED, ClaimStatus.PICKED_UP, ClaimStatus.DELIVERED];

function getRecommendationScore(donation: DonationView, accepted: FoodCategory[], serviceAreas: string[]) {
  const categoryScore = accepted.includes(donation.category) ? 35 : 5;
  const areaScore = serviceAreas.some((area) => donation.pickup.approximateArea.toLowerCase().includes(area.toLowerCase())) ? 25 : 16;
  const distanceScore = Math.max(5, 25 - Math.round((donation.pickup.distanceKm ?? 12) * 2));
  const urgencyScore = Math.round(calculateUrgencyScore({ safePickupDeadline: donation.safePickupDeadline, priority: donation.priority }) * 0.15);
  return Math.min(99, categoryScore + areaScore + distanceScore + urgencyScore);
}

export function useNgoDashboard() {
  const [state, setState] = useState<AsyncState<NGODashboardData>>(() => asyncState.loading());
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };
    Promise.all([
      profileService.getOwnProfile(NGO_USER_ID, NGO_VIEWER, options),
      donationService.list({ viewer: NGO_VIEWER, statuses: [DonationStatus.AVAILABLE] }, options),
      claimService.list({ ngoProfileId: NGO_PROFILE_ID }, options),
      impactService.getNgoOverview(NGO_PROFILE_ID, NGO_VIEWER, options),
      notificationService.listForUser(NGO_USER_ID, NGO_VIEWER, options),
      requestService.list({ ngoProfileId: NGO_PROFILE_ID }, options),
    ]).then(async ([profile, availableDonations, claims, impact, notifications, requests]) => {
      const ngo = profile.ngoProfile;
      if (!ngo) throw new Error("The NGO profile is unavailable.");
      const activeClaims = claims.filter((claim) => ACTIVE_CLAIMS.includes(claim.status));
      const claimDonations = await Promise.all(activeClaims.map((claim) => donationService.getById(claim.donationId, NGO_VIEWER, options)));
      const scored = availableDonations.map((donation) => ({ donation, score: getRecommendationScore(donation, ngo.acceptedFoodCategories, ngo.serviceAreas) })).sort((left, right) => right.score - left.score);

      const claimActivities: NGOActivity[] = activeClaims.slice(0, 3).map((claim) => {
        const donation = claimDonations.find((item) => item.id === claim.donationId);
        return { id: `claim-${claim.id}`, kind: "CLAIM", title: donation?.title ?? "Active food rescue", description: `Claim is ${STATUS_META[claim.status].label.toLowerCase()}.`, timestamp: claim.updatedAt, href: ROUTES.ngo.claim(claim.id) };
      });
      const notificationActivities: NGOActivity[] = notifications.slice(0, 3).map((notification) => ({ id: `notification-${notification.id}`, kind: "NOTIFICATION", title: notification.title, description: notification.message, timestamp: notification.createdAt }));
      const requestActivities: NGOActivity[] = requests.slice(0, 2).map((request) => ({ id: `request-${request.id}`, kind: "REQUEST", title: request.title, description: `Demand request is ${STATUS_META[request.status].label.toLowerCase()}.`, timestamp: request.updatedAt }));
      const impactActivities: NGOActivity[] = impact.recentRecords.slice(0, 2).map((record) => ({ id: `impact-${record.id}`, kind: "IMPACT", title: `${record.mealsRescued} meals distributed`, description: `${record.beneficiariesServed} beneficiaries served in this mock impact record.`, timestamp: record.recordedAt }));

      setState(asyncState.success({
        profile,
        stats: { availableNearby: availableDonations.filter((item) => (item.pickup.distanceKm ?? 999) <= 15).length, activeClaims: activeClaims.length, mealsDistributed: impact.mealsDistributed, beneficiariesServed: impact.beneficiariesServed },
        recommendedDonation: scored[0]?.donation,
        recommendedMatchScore: scored[0]?.score ?? 0,
        activeClaims: activeClaims.map((claim) => ({ claim, donation: claimDonations.find((item) => item.id === claim.donationId)! })).filter((item) => Boolean(item.donation)),
        activities: [...claimActivities, ...notificationActivities, ...requestActivities, ...impactActivities].sort((left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp)).slice(0, 7),
        requests,
        notifications,
      }));
    }).catch((error: unknown) => { if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error))); });
    return () => controller.abort();
  }, [retryKey]);

  function retry() {
    setState((current) => asyncState.loading(current.data));
    setRetryKey((value) => value + 1);
  }

  return { state, retry };
}
