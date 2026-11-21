"use client";
import { useCallback, useEffect, useState } from "react";
import { useMockAuth } from "@/features/auth/mock-auth";
export function useSavedDonations() {
  const { session } = useMockAuth();
  const owner = session?.id;
  const [snapshot, setSnapshot] = useState<{ owner: string; ids: string[] }>();
  useEffect(() => {
    if (!owner) return;
    const timer = setTimeout(() => {
      let ids: string[] = [];
      try {
        const value: unknown = JSON.parse(
          sessionStorage.getItem(`sharebite.ngo.saved-donations:${owner}`) ||
            "[]",
        );
        if (Array.isArray(value))
          ids = value.filter((id): id is string => typeof id === "string");
      } catch {}
      setSnapshot({ owner, ids });
    }, 0);
    return () => clearTimeout(timer);
  }, [owner]);
  const savedIds = snapshot?.owner === owner ? snapshot?.ids || [] : [];
  const toggleSaved = useCallback(
    (id: string) => {
      if (!owner) return;
      setSnapshot((previous) => {
        const ids = previous?.owner === owner ? previous?.ids || [] : [];
        const next = ids.includes(id)
          ? ids.filter((value) => value !== id)
          : [...ids, id];
        try {
          sessionStorage.setItem(
            `sharebite.ngo.saved-donations:${owner}`,
            JSON.stringify(next),
          );
        } catch {}
        return { owner, ids: next };
      });
    },
    [owner],
  );
  return { savedIds, toggleSaved };
}
