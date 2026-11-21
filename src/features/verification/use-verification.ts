"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMockAuth } from "@/features/auth/mock-auth";
import type { VerificationState } from "./types";
export function useVerification() {
  const { session } = useMockAuth();
  const owner = session?.id;
  const observed = useRef<{ owner: string; signature: string } | undefined>(
    undefined,
  );
  const [revision, setRevision] = useState(0);
  const [snapshot, setSnapshot] = useState<{
    owner: string;
    data?: VerificationState;
    error?: string;
  }>();
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    if (!owner) return;
    const controller = new AbortController();
    let inFlight = false;
    async function load() {
      if (inFlight || controller.signal.aborted) return;
      inFlight = true;
      try {
        const response = await fetch("/api/verification", {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(
            data.error || "Verification details could not load. Try again.",
          );
        if (!controller.signal.aborted) {
          const signature = `${data.status}:${data.document?.id || ""}`;
          const prior = observed.current;
          const changed = prior && prior.owner === owner && prior.signature !== signature;
          observed.current = { owner: owner!, signature };
          setSnapshot({ owner: owner!, data });
          if (changed)
            window.dispatchEvent(new Event("sharebite:verification-changed"));
        }
      } catch (error) {
        if (!controller.signal.aborted)
          setSnapshot((previous) => ({
            owner: owner!,
            data: previous?.owner === owner ? previous?.data : undefined,
            error:
              error instanceof TypeError
                ? "Verification details could not load. Check your connection."
                : error instanceof Error
                  ? error.message
                  : "Verification details could not load. Try again.",
          }));
      } finally {
        inFlight = false;
      }
    }
    const visible = () => {
      if (document.visibilityState === "visible") void load();
    };
    void load();
    const timer = setInterval(visible, 10_000);
    window.addEventListener("focus", visible);
    window.addEventListener("sharebite:verification-refresh", visible);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", visible);
      window.removeEventListener("sharebite:verification-refresh", visible);
    };
  }, [owner, revision]);
  const current = snapshot?.owner === owner ? snapshot : undefined;
  return {
    role: session?.role,
    data: current?.data,
    error: current?.error,
    loading: !current,
    refresh,
  };
}
