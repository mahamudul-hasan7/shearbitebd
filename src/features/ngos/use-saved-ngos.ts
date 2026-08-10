"use client";

import { useEffect, useState } from "react";

const SAVED_NGOS_STORAGE_KEY = "sharebite.donor.saved-ngos.v1";

export function useSavedNgos() {
  const [savedNgoIds, setSavedNgoIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      try {
        const rawValue = window.sessionStorage.getItem(SAVED_NGOS_STORAGE_KEY);
        const parsed: unknown = rawValue ? JSON.parse(rawValue) : [];
        if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) setSavedNgoIds(new Set(parsed));
      } catch {
        window.sessionStorage.removeItem(SAVED_NGOS_STORAGE_KEY);
      }
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  function toggleSaved(ngoId: string) {
    setSavedNgoIds((current) => {
      const next = new Set(current);
      if (next.has(ngoId)) next.delete(ngoId);
      else next.add(ngoId);
      try {
        window.sessionStorage.setItem(SAVED_NGOS_STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // The in-memory saved state still works when browser storage is unavailable.
      }
      return next;
    });
  }

  return {
    savedNgoIds,
    isSaved: (ngoId: string) => savedNgoIds.has(ngoId),
    toggleSaved,
  };
}
