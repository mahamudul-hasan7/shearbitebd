"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { MockAuthSession } from "@/features/auth/types";
import { UserRole } from "@/lib/constants/roles";
import { ROUTES } from "@/lib/routes";

const LOCAL_SESSION_KEY = "sharebite.mock-auth.remembered";
const BROWSER_SESSION_KEY = "sharebite.mock-auth.session";

type AuthStatus = "loading" | "anonymous" | "authenticated";

interface MockAuthContextValue {
  status: AuthStatus;
  session?: MockAuthSession;
  signIn: (input: { email: string; displayName: string; role: UserRole; remember: boolean }) => void;
  signOut: () => void;
}

const MockAuthContext = createContext<MockAuthContextValue | undefined>(undefined);

function isMockSession(value: unknown): value is MockAuthSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<MockAuthSession>;
  return (
    typeof session.email === "string" &&
    typeof session.displayName === "string" &&
    typeof session.signedInAt === "string" &&
    Object.values(UserRole).includes(session.role as UserRole)
  );
}

function readSession(storage: Storage, key: string) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return undefined;
    const parsed: unknown = JSON.parse(raw);
    return isMockSession(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<MockAuthSession>();

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      const stored = readSession(window.localStorage, LOCAL_SESSION_KEY) ?? readSession(window.sessionStorage, BROWSER_SESSION_KEY);
      setSession(stored);
      setStatus(stored ? "authenticated" : "anonymous");
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  const value = useMemo<MockAuthContextValue>(() => ({
    status,
    session,
    signIn(input) {
      const nextSession: MockAuthSession = {
        email: input.email.trim().toLowerCase(),
        displayName: input.displayName.trim(),
        role: input.role,
        signedInAt: new Date().toISOString(),
      };
      window.localStorage.removeItem(LOCAL_SESSION_KEY);
      window.sessionStorage.removeItem(BROWSER_SESSION_KEY);
      const storage = input.remember ? window.localStorage : window.sessionStorage;
      storage.setItem(input.remember ? LOCAL_SESSION_KEY : BROWSER_SESSION_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      setStatus("authenticated");
    },
    signOut() {
      window.localStorage.removeItem(LOCAL_SESSION_KEY);
      window.sessionStorage.removeItem(BROWSER_SESSION_KEY);
      setSession(undefined);
      setStatus("anonymous");
    },
  }), [session, status]);

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (!context) throw new Error("useMockAuth must be used within MockAuthProvider.");
  return context;
}

export function getRoleLandingRoute(role: UserRole) {
  if (role === UserRole.NGO) return ROUTES.ngo.dashboard;
  if (role === UserRole.VOLUNTEER) return ROUTES.volunteer.dashboard;
  if (role === UserRole.ADMIN) return ROUTES.auth.unauthorized;
  return ROUTES.donor.dashboard;
}
