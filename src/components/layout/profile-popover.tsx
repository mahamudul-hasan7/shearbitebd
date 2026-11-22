"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { RoleBadge } from "@/components/portal/role-badge";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useMockAuth } from "@/features/auth/mock-auth";
import { profileService, type ProfileBundle } from "@/services/profile.service";
import { ROUTES } from "@/lib/routes";
import type { PortalRole } from "@/types/navigation";

export function ProfilePopover({
  role,
  profileName,
  avatarInitials,
}: {
  role: PortalRole;
  profileName?: string;
  profileDescription?: string;
  avatarInitials?: string;
}) {
  const tx = useUiText();
  const { session, signOut } = useMockAuth();
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<{
    sessionId: string;
    profile: ProfileBundle;
  }>();
  const [error, setError] = useState("");
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open || !session) return;
    const controller = new AbortController();
    profileService
      .getOwnProfile("", {}, { signal: controller.signal })
      .then((profile) => {
        setSnapshot({ sessionId: session.id, profile });
        setError("");
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError("Account details could not load.");
      });
    return () => controller.abort();
  }, [open, session]);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", key);
    };
  }, []);
  const profile =
    snapshot?.sessionId === session?.id ? snapshot?.profile : undefined;
  const name = session?.displayName || profileName || "My account";
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    avatarInitials ||
    "U";
  const verification =
    profile?.donorProfile?.verificationStatus ||
    profile?.ngoProfile?.verificationStatus ||
    profile?.volunteerProfile?.verificationStatus;
  const home =
    role === "donor"
      ? ROUTES.donor.profile
      : role === "ngo"
        ? ROUTES.ngo.profile
        : ROUTES.volunteer.dashboard;
  const addresses =
    role === "donor"
      ? ROUTES.donor.addresses
      : role === "ngo"
        ? ROUTES.ngo.addresses
        : undefined;
  return (
    <div className="relative" ref={container}>
      <button
        type="button"
        aria-label={tx("Open account menu")}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(!open)}
        className="flex size-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-left sm:h-11 sm:w-auto sm:px-2.5"
      >
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--role-soft)] text-[10px] font-bold text-[var(--role-ink)]">
          {initials}
        </span>
        <span className="hidden max-w-32 truncate text-xs font-bold sm:block">
          {name}
        </span>
        <ChevronDown className="hidden size-3 sm:block" />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={tx("User Account Settings")}
          className="fixed inset-x-3 top-16 z-50 grid max-h-[calc(100dvh-5rem)] gap-3 overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-11 sm:w-80"
        >
          <div>
            <RoleBadge role={role} />
            <h3 className="mt-2 font-bold">{name}</h3>
            <p className="mt-1 break-all text-xs text-muted-600">
              {session?.email || "Sign in to view account details"}
            </p>
            {profile && (
              <p className="mt-1 text-xs">
                {profile.user.phone || "Phone not provided"}
              </p>
            )}
          </div>
          {verification && (
            <p className="rounded-xl bg-slate-50 p-3 text-xs">
              {tx("Account verification:")}{" "}
              {tx(verification.toLowerCase().replaceAll("_", " "))}
            </p>
          )}
          {error && (
            <p role="status" className="text-xs text-amber-800">
              {tx(error)}
            </p>
          )}
          <Link
            href={home}
            onClick={() => setOpen(false)}
            className="rounded-xl border p-3 text-sm font-semibold"
          >
            {tx("View account")}
          </Link>
          {addresses && (
            <Link
              href={addresses}
              onClick={() => setOpen(false)}
              className="rounded-xl border p-3 text-sm font-semibold"
            >
              {tx("Saved addresses & location pins")}
            </Link>
          )}
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-800"
          >
            <LogOut className="size-4" />
            {tx("Log out")}
          </button>
        </div>
      )}
    </div>
  );
}
