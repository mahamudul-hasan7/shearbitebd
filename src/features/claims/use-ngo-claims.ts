"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type SetStateAction,
} from "react";
import { useMockAuth } from "@/features/auth/mock-auth";
import { ClaimStatus } from "@/lib/constants/statuses";
import {
  NGO_PROFILE_ID,
  NGO_VIEWER,
} from "@/features/ngo-dashboard/use-ngo-dashboard";
import {
  ACTIVE_CLAIM_STATUSES,
  COMPLETED_CLAIM_STATUSES,
  type ClaimFilter,
} from "@/features/claims/types";
import { claimStatusLabelBn } from "@/features/claims/claim-presentation";
import {
  getDonationTitleBn,
  getDonorOrganizationBn,
} from "@/features/donations/donation-presentation";
import {
  asyncState,
  claimService,
  toServiceError,
  type AsyncState,
  type ClaimCoordinationDetails,
} from "@/services";

async function loadNgoClaims(signal?: AbortSignal) {
  const claims = await claimService.list(
    { ngoProfileId: NGO_PROFILE_ID },
    { signal },
  );
  return Promise.all(
    claims.map((claim) =>
      claimService.getCoordinationDetails(claim.id, NGO_VIEWER, {
        signal,
        delayMs: 80,
      }),
    ),
  );
}

export function useNgoClaims() {
  const [state, setState] = useState<AsyncState<ClaimCoordinationDetails[]>>(
    () => asyncState.loading(),
  );
  const [filter, setFilter] = useState<ClaimFilter>("ALL");
  const [search, setSearch] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    loadNgoClaims(controller.signal)
      .then((items) => setState(asyncState.success(items)))
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setState(asyncState.error(toServiceError(error)));
      });
    return () => controller.abort();
  }, [retryKey]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (state.data ?? []).filter((item) => {
      if (filter !== "ALL" && item.claim.status !== filter) return false;
      if (!query) return true;
      const titleBn = getDonationTitleBn(item.donation.title);
      const donorBn = getDonorOrganizationBn(item.donorOrganization);
      const statusBn = claimStatusLabelBn(item.claim.status);
      const haystack =
        `${item.claim.id} ${item.donation.title} ${titleBn} ${item.donorOrganization} ${donorBn} ${statusBn} ${item.donation.pickup.approximateArea} ${item.volunteer?.displayName ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [filter, search, state.data]);

  const stats = useMemo(() => {
    const claims = state.data ?? [];
    return {
      total: claims.length,
      reserved: claims.filter(
        (item) => item.claim.status === ClaimStatus.RESERVED,
      ).length,
      inProgress: claims.filter((item) =>
        [
          ClaimStatus.ASSIGNED,
          ClaimStatus.PICKED_UP,
          ClaimStatus.DELIVERED,
        ].includes(item.claim.status),
      ).length,
      completed: claims.filter((item) =>
        COMPLETED_CLAIM_STATUSES.has(item.claim.status),
      ).length,
      active: claims.filter((item) =>
        ACTIVE_CLAIM_STATUSES.has(item.claim.status),
      ).length,
    };
  }, [state.data]);

  const retry = useCallback(() => {
    setState((current) => asyncState.loading(current.data));
    setRetryKey((value) => value + 1);
  }, []);

  return {
    state,
    filter,
    setFilter,
    search,
    setSearch,
    filteredItems,
    stats,
    retry,
  };
}

export function useNgoClaim(claimId: string) {
  const { session } = useMockAuth();
  const owner = session?.role === "NGO" ? session.id : undefined;
  const key = `${owner}:${claimId}`;
  const activeKey = useRef<string | undefined>(key),
    actionLock = useRef(false);
  const [snapshot, setSnapshot] = useState<{
    key: string;
    state: AsyncState<ClaimCoordinationDetails>;
  }>();
  const state =
    snapshot?.key === key
      ? snapshot.state
      : asyncState.loading<ClaimCoordinationDetails>();
  const [actionNotice, setActionNotice] = useState<{
    key: string;
    error?: string;
    message?: string;
  }>();
  const [busy, setBusy] = useState(false),
    [retryKey, setRetryKey] = useState(0);
  useEffect(() => {
    activeKey.current = key;
    return () => {
      activeKey.current = undefined;
    };
  }, [key]);
  const setState = useCallback(
    (next: SetStateAction<AsyncState<ClaimCoordinationDetails>>) => {
      setSnapshot((previous) => {
        if (activeKey.current !== key) return previous;
        const current =
          previous?.key === key
            ? previous.state
            : asyncState.loading<ClaimCoordinationDetails>();
        return {
          key,
          state: typeof next === "function" ? next(current) : next,
        };
      });
    },
    [key],
  );
  const load = useCallback(
    async (signal?: AbortSignal) => {
      const details = await claimService.getCoordinationDetails(
        claimId,
        {},
        { signal },
      );
      if (!signal?.aborted)
        setState((current) =>
          current.data &&
          Date.parse(current.data.claim.updatedAt) >
            Date.parse(details.claim.updatedAt)
            ? current
            : asyncState.success(details),
        );
    },
    [claimId, setState],
  );
  useEffect(() => {
    if (!owner) return;
    const controller = new AbortController();
    let inFlight = false;
    async function poll() {
      if (inFlight || controller.signal.aborted) return;
      inFlight = true;
      try {
        await load(controller.signal);
      } catch (error) {
        if (!controller.signal.aborted)
          setState((current) =>
            asyncState.error(toServiceError(error), current.data),
          );
      } finally {
        inFlight = false;
      }
    }
    const visible = () => {
      if (document.visibilityState === "visible") void poll();
    };
    void poll();
    const timer = setInterval(visible, 5000);
    window.addEventListener("focus", visible);
    document.addEventListener("visibilitychange", visible);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", visible);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [owner, retryKey, load, setState]);
  async function releaseClaim() {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusy(true);
    setActionNotice({ key });
    try {
      await claimService.transitionStatus(claimId, ClaimStatus.CANCELLED, {});
      await load();
      if (activeKey.current === key)
        setActionNotice({
          key,
          message:
            "The claim was released. Food can be reserved again while collection remains open.",
        });
    } catch (error) {
      if (activeKey.current === key)
        setActionNotice({ key, error: toServiceError(error).message });
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  }
  return {
    state,
    busy,
    actionError: actionNotice?.key === key ? actionNotice.error : undefined,
    actionMessage: actionNotice?.key === key ? actionNotice.message : undefined,
    retry: () => setRetryKey((value) => value + 1),
    releaseClaim,
  };
}
