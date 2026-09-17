"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { NGO_PROFILE_ID, NGO_VIEWER } from "@/features/ngo-dashboard/use-ngo-dashboard";
import type { RequestStatusFilter } from "@/features/requests/types";
import { RequestStatus } from "@/lib/constants/statuses";
import { asyncState, requestService, toServiceError, type AsyncState, type UpdateFoodRequestInput } from "@/services";
import type { FoodRequest } from "@/types/domain";

export function useNgoRequests() {
  const [state, setState] = useState<AsyncState<FoodRequest[]>>(() => asyncState.loading());
  const [filter, setFilter] = useState<RequestStatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    requestService.list({ ngoProfileId: NGO_PROFILE_ID }, { signal: controller.signal })
      .then((requests) => setState(asyncState.success(requests)))
      .catch((error: unknown) => { if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error))); });
    return () => controller.abort();
  }, [retryKey]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (state.data ?? []).filter((request) => {
      if (filter !== "ALL" && request.status !== filter) return false;
      if (!query) return true;
      return `${request.id} ${request.title} ${request.purpose} ${request.recipientType}`.toLowerCase().includes(query);
    });
  }, [filter, search, state.data]);

  const stats = useMemo(() => {
    const requests = state.data ?? [];
    return {
      total: requests.length,
      review: requests.filter((request) => request.status === RequestStatus.PENDING_REVIEW).length,
      matching: requests.filter((request) => [RequestStatus.FINDING_MATCH, RequestStatus.MATCHED].includes(request.status)).length,
      fulfilled: requests.filter((request) => request.status === RequestStatus.FULFILLED).length,
    };
  }, [state.data]);

  return {
    state,
    filter,
    setFilter,
    search,
    setSearch,
    filteredRequests,
    stats,
    retry: useCallback(() => setRetryKey((value) => value + 1), []),
  };
}

export function useNgoRequest(requestId: string) {
  const [state, setState] = useState<AsyncState<FoodRequest>>(() => asyncState.loading());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();
  const [actionError, setActionError] = useState<string>();
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    requestService.getById(requestId, { signal: controller.signal })
      .then((request) => setState(asyncState.success(request)))
      .catch((error: unknown) => { if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error))); });
    return () => controller.abort();
  }, [requestId, retryKey]);

  const runAction = useCallback(async (action: () => Promise<FoodRequest>, successMessage: string) => {
    setBusy(true);
    setMessage(undefined);
    setActionError(undefined);
    try {
      const request = await action();
      setState(asyncState.success(request));
      setMessage(successMessage);
      return true;
    } catch (error: unknown) {
      setActionError(toServiceError(error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    state,
    busy,
    message,
    actionError,
    retry: () => setRetryKey((value) => value + 1),
    update: (input: UpdateFoodRequestInput) => runAction(() => requestService.update(requestId, input, NGO_VIEWER), "Request details updated in the mock workspace."),
    cancel: () => runAction(() => requestService.transitionStatus(requestId, RequestStatus.CANCELLED, NGO_VIEWER), "The request was cancelled and removed from active matching."),
  };
}
