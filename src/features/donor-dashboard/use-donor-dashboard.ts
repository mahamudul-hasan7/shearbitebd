"use client";

import { useEffect, useState } from "react";
import { DonationStatus, STATUS_META } from "@/lib/constants/statuses";
import { UserRole } from "@/lib/constants/roles";
import {
  asyncState,
  donationService,
  impactService,
  ngoService,
  notificationService,
  profileService,
  toServiceError,
  type AsyncState,
} from "@/services";
import type { ViewerContext } from "@/types/domain";
import type { DashboardActivity, DonorDashboardData, SupportedNGOSummary } from "@/features/donor-dashboard/types";

const DASHBOARD_USER_ID = "user-donor-uiu";
const DASHBOARD_DONOR_ID = "donor-uiu";
const DASHBOARD_VIEWER: ViewerContext = {
  userId: DASHBOARD_USER_ID,
  role: UserRole.DONOR,
  donorProfileId: DASHBOARD_DONOR_ID,
};

const ACTIVE_STATUSES = new Set<DonationStatus>([
  DonationStatus.PUBLISHED,
  DonationStatus.AVAILABLE,
  DonationStatus.RESERVED,
  DonationStatus.ASSIGNED,
  DonationStatus.PICKED_UP,
  DonationStatus.DELIVERED,
]);

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "FD";
}

export function useDonorDashboard() {
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<AsyncState<DonorDashboardData>>(() => asyncState.loading());

  useEffect(() => {
    const controller = new AbortController();
    const serviceOptions = { signal: controller.signal };

    Promise.all([
      profileService.getOwnProfile(DASHBOARD_USER_ID, DASHBOARD_VIEWER, serviceOptions),
      donationService.list({ donorProfileId: DASHBOARD_DONOR_ID, viewer: DASHBOARD_VIEWER }, serviceOptions),
      impactService.getDonorOverview(DASHBOARD_DONOR_ID, DASHBOARD_VIEWER, serviceOptions),
      notificationService.listForUser(DASHBOARD_USER_ID, DASHBOARD_VIEWER, serviceOptions),
      ngoService.listVerified(serviceOptions),
    ]).then(([profile, donations, impact, notifications, ngos]) => {
      const donorProfile = profile.donorProfile;
      if (!donorProfile) throw new Error("The donor profile is unavailable.");

      const donationActivities: DashboardActivity[] = donations.slice(0, 3).map((donation) => ({
        id: `activity-${donation.id}`,
        kind: "donation",
        title: donation.title,
        description: `Donation is ${STATUS_META[donation.status].label.toLowerCase()}.`,
        timestamp: donation.updatedAt,
        href: `/donor/donations/${donation.id}`,
      }));
      const notificationActivities: DashboardActivity[] = notifications.slice(0, 3).map((notification) => ({
        id: `activity-${notification.id}`,
        kind: "notification",
        title: notification.title,
        description: notification.message,
        timestamp: notification.createdAt,
        href: notification.href,
      }));
      const impactActivities: DashboardActivity[] = impact.recentRecords.slice(0, 3).map((record) => ({
        id: `activity-${record.id}`,
        kind: "impact",
        title: `${record.mealsRescued} meals added to impact`,
        description: `${record.foodWeightKg} kg of food was recorded as rescued. Environmental values remain estimated.`,
        timestamp: record.recordedAt,
        href: "/donor/donations",
      }));
      const activities = [...donationActivities, ...notificationActivities, ...impactActivities]
        .sort((left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp))
        .slice(0, 6);

      const supportedNgos = impact.recentRecords.reduce<SupportedNGOSummary[]>((items, record) => {
        if (!record.ngoProfileId) return items;
        const ngo = ngos.find((item) => item.profile.id === record.ngoProfileId);
        if (!ngo) return items;
        const existing = items.find((item) => item.id === ngo.profile.id);
        if (existing) {
          existing.mealsSupported += record.mealsRescued;
          if (Date.parse(record.recordedAt) > Date.parse(existing.lastSupportedAt)) existing.lastSupportedAt = record.recordedAt;
          return items;
        }
        items.push({
          id: ngo.profile.id,
          name: ngo.profile.organizationName,
          serviceAreas: [...ngo.profile.serviceAreas],
          completedRescues: ngo.profile.completedRescues,
          mealsSupported: record.mealsRescued,
          lastSupportedAt: record.recordedAt,
        });
        return items;
      }, []).sort((left, right) => Date.parse(right.lastSupportedAt) - Date.parse(left.lastSupportedAt));

      setState(asyncState.success({
        profile: {
          name: profile.user.displayName,
          email: profile.user.email,
          initials: getInitials(profile.user.displayName),
          description: donorProfile.organizationName ? "Verified food donor" : "Food donor",
        },
        stats: {
          totalDonations: impact.totalDonations,
          activeDonations: impact.activeDonations,
          mealsRescued: impact.mealsRescued,
          ngosHelped: impact.ngosHelped,
          donorScore: impact.donorScore,
          donorScoreDescription: impact.donorScoreDescription,
        },
        donations,
        activeDonation: donations.find((donation) => ACTIVE_STATUSES.has(donation.status)),
        activities,
        supportedNgos,
        impactRecords: impact.recentRecords,
        unreadNotifications: notifications.filter((notification) => !notification.readAt).length,
      }));
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      setState(asyncState.error(toServiceError(error)));
    });

    return () => controller.abort();
  }, [retryKey]);

  function retry() {
    setState((current) => asyncState.loading(current.data));
    setRetryKey((current) => current + 1);
  }

  return { state, retry };
}
