"use client";

import { useEffect, useState } from "react";
import { UserRole } from "@/lib/constants/roles";
import { asyncState, toServiceError, trackingService, type AsyncState, type DonationTrackingData } from "@/services";
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
    trackingService.getByDonationId(donationId, DONOR_VIEWER, { signal: controller.signal }).then((data) => {
      setState(asyncState.success(data));
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error)));
    });
    return () => controller.abort();
  }, [donationId, retryKey]);

  function refresh() {
    setState((current) => asyncState.loading(current.data));
    setRetryKey((current) => current + 1);
  }

  return { state, refresh, viewer: DONOR_VIEWER };
}
