"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { IncidentType, PriorityLevel } from "@/lib/constants/domain";
import { ClaimStatus } from "@/lib/constants/statuses";
import { NGO_PROFILE_ID, NGO_VIEWER } from "@/features/ngo-dashboard/use-ngo-dashboard";
import { ACTIVE_CLAIM_STATUSES, COMPLETED_CLAIM_STATUSES, type ClaimFilter } from "@/features/claims/types";
import { asyncState, claimService, incidentService, toServiceError, type AsyncState, type ClaimCoordinationDetails } from "@/services";

const DEMO_VOLUNTEER_ID = "volunteer-demo";

async function loadNgoClaims(signal?: AbortSignal) {
  const claims = await claimService.list({ ngoProfileId: NGO_PROFILE_ID }, { signal });
  return Promise.all(claims.map((claim) => claimService.getCoordinationDetails(claim.id, NGO_VIEWER, { signal, delayMs: 80 })));
}

export function useNgoClaims() {
  const [state, setState] = useState<AsyncState<ClaimCoordinationDetails[]>>(() => asyncState.loading());
  const [filter, setFilter] = useState<ClaimFilter>("ALL");
  const [search, setSearch] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    loadNgoClaims(controller.signal)
      .then((items) => setState(asyncState.success(items)))
      .catch((error: unknown) => { if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error))); });
    return () => controller.abort();
  }, [retryKey]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (state.data ?? []).filter((item) => {
      if (filter !== "ALL" && item.claim.status !== filter) return false;
      if (!query) return true;
      return `${item.claim.id} ${item.donation.title} ${item.donorOrganization} ${item.donation.pickup.approximateArea} ${item.volunteer?.displayName ?? ""}`.toLowerCase().includes(query);
    });
  }, [filter, search, state.data]);

  const stats = useMemo(() => {
    const claims = state.data ?? [];
    return {
      total: claims.length,
      reserved: claims.filter((item) => item.claim.status === ClaimStatus.RESERVED).length,
      inProgress: claims.filter((item) => [ClaimStatus.ASSIGNED, ClaimStatus.PICKED_UP, ClaimStatus.DELIVERED].includes(item.claim.status)).length,
      completed: claims.filter((item) => COMPLETED_CLAIM_STATUSES.has(item.claim.status)).length,
      active: claims.filter((item) => ACTIVE_CLAIM_STATUSES.has(item.claim.status)).length,
    };
  }, [state.data]);

  const retry = useCallback(() => {
    setState((current) => asyncState.loading(current.data));
    setRetryKey((value) => value + 1);
  }, []);

  return { state, filter, setFilter, search, setSearch, filteredItems, stats, retry };
}

export function useNgoClaim(claimId: string) {
  const [state, setState] = useState<AsyncState<ClaimCoordinationDetails>>(() => asyncState.loading());
  const [actionError, setActionError] = useState<string>();
  const [actionMessage, setActionMessage] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const load = useCallback(async (signal?: AbortSignal) => {
    const details = await claimService.getCoordinationDetails(claimId, NGO_VIEWER, { signal });
    setState(asyncState.success(details));
  }, [claimId]);

  useEffect(() => {
    const controller = new AbortController();
    claimService.getCoordinationDetails(claimId, NGO_VIEWER, { signal: controller.signal })
      .then((details) => setState(asyncState.success(details)))
      .catch((error: unknown) => { if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error))); });
    return () => controller.abort();
  }, [claimId, retryKey]);

  const runAction = useCallback(async (action: () => Promise<unknown>, successMessage: string) => {
    setBusy(true);
    setActionError(undefined);
    setActionMessage(undefined);
    try {
      await action();
      await load();
      setActionMessage(successMessage);
    } catch (error: unknown) {
      setActionError(toServiceError(error).message);
    } finally {
      setBusy(false);
    }
  }, [load]);

  return {
    state,
    busy,
    actionError,
    actionMessage,
    retry: () => setRetryKey((value) => value + 1),
    assignVolunteer: () => runAction(() => claimService.assignDemoVolunteer(claimId, DEMO_VOLUNTEER_ID, NGO_VIEWER), "A verified demo volunteer was assigned."),
    releaseClaim: () => runAction(() => claimService.transitionStatus(claimId, ClaimStatus.CANCELLED, NGO_VIEWER), "The claim was released and the donation is available again."),
    markPickedUp: () => runAction(() => claimService.transitionStatus(claimId, ClaimStatus.PICKED_UP, NGO_VIEWER), "Pickup verification completed in demo mode."),
    confirmDelivered: () => runAction(() => claimService.transitionStatus(claimId, ClaimStatus.DELIVERED, NGO_VIEWER), "Delivery received and recorded in demo mode."),
    reportIssue: (description: string) => runAction(() => incidentService.createForDonation(state.data?.donation.id ?? "", { type: IncidentType.OTHER, severity: PriorityLevel.HIGH, description, preferredContactMethod: "IN_APP" }, NGO_VIEWER), "The issue was submitted and normal progression is paused."),
  };
}
