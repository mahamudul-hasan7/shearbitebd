"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { MockAuthSession } from "@/features/auth/types";
import { setClientSession } from "@/features/auth/client-session";
import { UserRole } from "@/lib/constants/roles";
import { ROUTES } from "@/lib/routes";

type AuthStatus = "loading" | "anonymous" | "authenticated";
interface MockAuthContextValue {
  status: AuthStatus;
  session?: MockAuthSession;
  signIn: (input: { email: string; password: string; remember: boolean }) => Promise<MockAuthSession>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<MockAuthSession | undefined>;
}

// Existing import names remain compatible while feature data is migrated in phases.
const MockAuthContext = createContext<MockAuthContextValue | undefined>(undefined);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<MockAuthSession>();
  const revision = useRef(0);
  const applySession = useCallback((value: MockAuthSession | undefined) => {
    revision.current++;
    setClientSession(value);
    setSession(value);
    setStatus(value ? "authenticated" : "anonymous");
  }, []);

  const refreshSession = useCallback(async () => {
    const requestRevision = ++revision.current;
    const response = await fetch("/api/auth/session", { cache: "no-store" });
    if (!response.ok) throw new Error("সেশন যাচাই করা যায়নি। আবার চেষ্টা করুন।");
    const data = await response.json() as { session: MockAuthSession | null };
    if (requestRevision === revision.current) applySession(data.session ?? undefined);
    return data.session ?? undefined;
  }, [applySession]);

  useEffect(() => {
    // Discard the former browser-controlled identity, including role-switch data.
    try { localStorage.removeItem("sharebite.mock-auth.remembered"); } catch {}
    try { sessionStorage.removeItem("sharebite.mock-auth.session"); } catch {}
    let active = true;
    const sync = () => { if (active) void refreshSession().catch(() => { if (active) applySession(undefined); }); };
    sync();
    window.addEventListener("focus", sync);
    window.addEventListener("sharebite:auth-changed", sync);
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("sharebite-auth") : undefined;
    if (channel) channel.onmessage = sync;
    return () => { active = false; window.removeEventListener("focus", sync); window.removeEventListener("sharebite:auth-changed", sync); channel?.close(); };
  }, [applySession, refreshSession]);

  const announceChange = useCallback(() => {
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("sharebite-auth");
      channel.postMessage("changed");
      channel.close();
    }
  }, []);

  const signIn = useCallback(async (input: { email: string; password: string; remember: boolean }) => {
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    const data = await response.json() as { session?: MockAuthSession; error?: string };
    if (!response.ok || !data.session) throw new Error(data.error || "লগইন করা যায়নি।");
    applySession(data.session);
    announceChange();
    return data.session;
  }, [applySession, announceChange]);

  const signOut = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("লগআউট করা যায়নি। আবার চেষ্টা করুন।");
      applySession(undefined);
      announceChange();
      // Clear cached layouts and private React state only after server revocation.
      window.location.replace(ROUTES.auth.login);
    } catch {
      window.alert("লগআউট করা যায়নি। সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।");
    }
  }, [applySession, announceChange]);

  const value = useMemo(() => ({ status, session, signIn, signOut, refreshSession }), [status, session, signIn, signOut, refreshSession]);
  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (!context) throw new Error("useMockAuth must be used within MockAuthProvider.");
  return context;
}

export function getRoleLandingRoute(role: UserRole | string) {
  const norm = String(role || "").toUpperCase();
  if (norm === "NGO") return ROUTES.ngo.dashboard;
  if (norm === "VOLUNTEER") return ROUTES.volunteer.dashboard;
  if (norm === "ADMIN") return ROUTES.admin.dashboard;
  return ROUTES.donor.dashboard;
}
