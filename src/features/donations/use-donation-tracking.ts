"use client";

import { useEffect, useState } from "react";
import { UserRole } from "@/lib/constants/roles";
import { asyncState, toServiceError, type AsyncState } from "@/services/shared";
import { trackingService, type DonationTrackingData } from "@/services/tracking.service";
import type { ViewerContext } from "@/types/domain";

const DONOR_VIEWER: ViewerContext = {
  userId: "user-donor-uiu",
  donorProfileId: "donor-uiu",
  role: UserRole.DONOR,
};

export function useDonationTracking(donationId: string) {
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<AsyncState<DonationTrackingData>>(() => asyncState.loading());

  useEffect(() => {
    const controller = new AbortController();
    let inFlight = false;
    const poll = async () => {
      if (inFlight || controller.signal.aborted) return;
      inFlight = true;
      try {
        const data = await trackingService.getByDonationId(donationId, DONOR_VIEWER, { signal: controller.signal });
        if (!controller.signal.aborted) setState(asyncState.success(data));
      } catch (error) {
        if (!controller.signal.aborted) setState((current) => asyncState.error(toServiceError(error), current.data));
      } finally { inFlight = false; }
    };
    const refreshVisible = () => { if (document.visibilityState === "visible") void poll(); };
    void poll();
    const timer = window.setInterval(refreshVisible, 5_000);
    window.addEventListener("focus", refreshVisible);
    document.addEventListener("visibilitychange", refreshVisible);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener("focus", refreshVisible); document.removeEventListener("visibilitychange", refreshVisible); };
  }, [donationId, retryKey]);

  function refresh() {
    setState((current) => asyncState.loading(current.data));
    setRetryKey((current) => current + 1);
  }

  return { state, refresh, viewer: DONOR_VIEWER };
}
