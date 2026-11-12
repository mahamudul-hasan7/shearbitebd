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

const memoryStorage = new Map<string, string>();

function getSafeStorage(type: "localStorage" | "sessionStorage"): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    const storage = window[type];
    const testKey = "__sb_test__";
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return storage;
  } catch {
    return null;
  }
}

function readSession(type: "localStorage" | "sessionStorage", key: string): MockAuthSession | undefined {
  try {
    const storage = getSafeStorage(type);
    const raw = storage ? storage.getItem(key) : memoryStorage.get(key);
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
      const stored = readSession("localStorage", LOCAL_SESSION_KEY) ?? readSession("sessionStorage", BROWSER_SESSION_KEY);
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
      const serialized = JSON.stringify(nextSession);
      const targetKey = input.remember ? LOCAL_SESSION_KEY : BROWSER_SESSION_KEY;
      const otherKey = input.remember ? BROWSER_SESSION_KEY : LOCAL_SESSION_KEY;

      memoryStorage.delete(otherKey);
      memoryStorage.set(targetKey, serialized);

      try {
        getSafeStorage("localStorage")?.removeItem(LOCAL_SESSION_KEY);
      } catch {}
      try {
        getSafeStorage("sessionStorage")?.removeItem(BROWSER_SESSION_KEY);
      } catch {}
      try {
        const storage = getSafeStorage(input.remember ? "localStorage" : "sessionStorage");
        storage?.setItem(targetKey, serialized);
      } catch {}

      setSession(nextSession);
      setStatus("authenticated");
    },
    signOut() {
      memoryStorage.delete(LOCAL_SESSION_KEY);
      memoryStorage.delete(BROWSER_SESSION_KEY);
      try {
        getSafeStorage("localStorage")?.removeItem(LOCAL_SESSION_KEY);
      } catch {}
      try {
        getSafeStorage("sessionStorage")?.removeItem(BROWSER_SESSION_KEY);
      } catch {}
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
