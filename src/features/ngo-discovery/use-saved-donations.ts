"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sharebite.ngo.saved-donations";

export function useSavedDonations() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      try {
        const value: unknown = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "[]");
        if (Array.isArray(value)) setSavedIds(value.filter((item): item is string => typeof item === "string"));
      } catch { window.sessionStorage.removeItem(STORAGE_KEY); }
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  const toggleSaved = useCallback((id: string) => {
    setSavedIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { savedIds, toggleSaved };
}
