"use client";

import { useEffect, useState } from "react";
import { STATUS_META } from "@/lib/constants/statuses";
import { useMockAuth } from "@/features/auth/mock-auth";
import { asyncState, toServiceError, type AsyncState } from "@/services/shared";
import { donationService } from "@/services/donation.service";
import { impactService } from "@/services/impact.service";
import { notificationService } from "@/services/notification.service";
import { profileService } from "@/services/profile.service";
import type { DonorDashboardData } from "@/features/donor-dashboard/types";
import { selectActiveDonation } from "./active-donation";

export function useDonorDashboard() {
  const { session } = useMockAuth();
  const userId = session?.id;
  const donorId = session?.donorProfileId;
  const [retryKey, setRetryKey] = useState(0);
  const [snapshot, setSnapshot] = useState<{ owner: string; state: AsyncState<DonorDashboardData> }>();

  useEffect(() => {
    if (!userId || !donorId) return;
    const controller = new AbortController();
    const options = { signal: controller.signal };
    let inFlight = false;
    const poll = async () => {
      if (inFlight || controller.signal.aborted) return;
      inFlight = true;
      try {
        const [profile, donations, impact, notifications] = await Promise.all([
      profileService.getOwnProfile(userId, {}, options),
      donationService.list({}, options),
      impactService.getDonorOverview(donorId, {}, options),
      notificationService.listForUser(userId, {}, options),
        ]);
      if (controller.signal.aborted) return;
      const name = profile.donorProfile?.organizationName || profile.user.displayName;
      setSnapshot({ owner: userId, state: asyncState.success({
        profile: { name, email: profile.user.email, initials: name.split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase(), description: profile.donorProfile?.verificationStatus === "VERIFIED" ? "Verified food donor" : "Food donor — verification pending" },
        stats: { totalDonations: impact.totalDonations, activeDonations: impact.activeDonations, mealsRescued: impact.mealsRescued, ngosHelped: impact.ngosHelped, donorScore: impact.donorScore, donorScoreDescription: impact.donorScoreDescription },
        donations, activeDonation: selectActiveDonation(donations),
        activities: donations.slice(0, 6).map((d) => ({ id: d.id, kind: "donation", title: d.title, description: STATUS_META[d.status].label, timestamp: d.updatedAt, href: `/donor/donations/${d.id}` })),
        supportedNgos: [], impactRecords: impact.recentRecords, unreadNotifications: notifications.filter((n) => !n.readAt).length,
      }) });
      } catch (error) {
        if (!controller.signal.aborted) setSnapshot((previous) => ({ owner: userId, state: asyncState.error(toServiceError(error), previous?.owner === userId ? previous.state.data : undefined) }));
      } finally { inFlight = false; }
    };
    const refreshVisible = () => { if (document.visibilityState === "visible") void poll(); };
    void poll();
    const timer = window.setInterval(refreshVisible, 5_000);
    window.addEventListener("focus", refreshVisible);
    document.addEventListener("visibilitychange", refreshVisible);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener("focus", refreshVisible); document.removeEventListener("visibilitychange", refreshVisible); };
  }, [userId, donorId, retryKey]);

  const state = snapshot && snapshot.owner === userId ? snapshot.state : asyncState.loading<DonorDashboardData>();
  return { state, retry: () => setRetryKey((n) => n + 1) };
}
