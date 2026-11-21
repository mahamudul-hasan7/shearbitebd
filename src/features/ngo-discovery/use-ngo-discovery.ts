"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useMockAuth } from "@/features/auth/mock-auth";
import {
  asyncState,
  discoveryService,
  toServiceError,
  type AsyncState,
  type NGODiscoveryItem,
} from "@/services";
import { DEFAULT_DISCOVERY_FILTERS, type DiscoveryFilters } from "./types";
import {
  discoveryQuery,
  filterDiscovery,
  parseDiscoveryFilters,
} from "./discovery-model";
import { useDiscoveryClock } from "./use-discovery-clock";

export function useNgoDiscovery() {
  const pathname = usePathname(),
    searchParams = useSearchParams();
  const { session } = useMockAuth();
  const owner = session?.role === "NGO" ? session.id : undefined;
  const [snapshot, setSnapshot] = useState<{
    owner: string;
    state: AsyncState<NGODiscoveryItem[]>;
  }>();
  const [revision, setRevision] = useState(0);
  const now = useDiscoveryClock();
  const filters = useMemo(
    () => parseDiscoveryFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const retry = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    if (!owner) return;
    const controller = new AbortController();
    let inFlight = false;
    async function load() {
      if (inFlight || controller.signal.aborted) return;
      inFlight = true;
      try {
        const data = await discoveryService.listAvailable(
          owner!,
          {},
          { signal: controller.signal },
        );
        if (!controller.signal.aborted)
          setSnapshot({ owner: owner!, state: asyncState.success(data) });
      } catch (error) {
        if (!controller.signal.aborted)
          setSnapshot((prior) => ({
            owner: owner!,
            state: asyncState.error(
              toServiceError(error),
              prior?.owner === owner ? prior?.state.data : undefined,
            ),
          }));
      } finally {
        inFlight = false;
      }
    }
    const refresh = () => {
      if (document.visibilityState === "visible") void load();
    };
    void load();
    const timer = setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    window.addEventListener("sharebite:auth-changed", refresh);
    window.addEventListener("sharebite:verification-changed", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("sharebite:auth-changed", refresh);
      window.removeEventListener("sharebite:verification-changed", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [owner, revision]);
  const state =
    snapshot?.owner === owner
      ? snapshot?.state || asyncState.loading<NGODiscoveryItem[]>()
      : asyncState.loading<NGODiscoveryItem[]>();
  const filteredItems = useMemo(
    () => (now ? filterDiscovery(state.data || [], filters, now) : []),
    [state.data, filters, now],
  );
  const activeFilterCount = (
    Object.keys(DEFAULT_DISCOVERY_FILTERS) as (keyof DiscoveryFilters)[]
  ).filter(
    (key) => key !== "sort" && filters[key] !== DEFAULT_DISCOVERY_FILTERS[key],
  ).length;
  function updateFilter<K extends keyof DiscoveryFilters>(
    key: K,
    value: DiscoveryFilters[K],
  ) {
    // Read the live URL so rapid filter changes compose before React renders again.
    const current = parseDiscoveryFilters(
      new URLSearchParams(window.location.search),
    );
    const query = discoveryQuery(
      parseDiscoveryFilters(
        new URLSearchParams(discoveryQuery({ ...current, [key]: value })),
      ),
    );
    window.history.replaceState(
      null,
      "",
      `${pathname}${query ? `?${query}` : ""}`,
    );
  }
  function resetFilters() {
    const current = parseDiscoveryFilters(
      new URLSearchParams(window.location.search),
    );
    const query = discoveryQuery({
      ...DEFAULT_DISCOVERY_FILTERS,
      sort: current.sort,
    });
    window.history.replaceState(
      null,
      "",
      `${pathname}${query ? `?${query}` : ""}`,
    );
  }
  return {
    state,
    filters,
    filteredItems,
    activeFilterCount,
    updateFilter,
    resetFilters,
    retry,
    now,
    queryString: discoveryQuery(filters),
  };
}
