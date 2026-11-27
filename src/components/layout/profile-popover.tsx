"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { VolunteerDutySwitch } from "@/features/volunteer-dashboard/volunteer-duty-switch";
import { RoleBadge } from "@/components/portal/role-badge";
import theme from "@/components/portal/portal-theme.module.css";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
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
  const [closing, setClosing] = useState(false);
  const [snapshot, setSnapshot] = useState<{
    sessionId: string;
    profile: ProfileBundle;
  }>();
  const [error, setError] = useState("");
  const container = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const isExpanded = open && !closing;

  const closeImmediate = useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setClosing(false);
    setOpen(false);
  }, []);

  const requestClose = useCallback(() => {
    if (!open || closing) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      closeImmediate();
      return;
    }
    setClosing(true);
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setClosing(false);
      setOpen(false);
    }, 160);
  }, [closeImmediate, closing, open]);

  const handleToggle = () => {
    if (isExpanded) {
      requestClose();
      return;
    }
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setClosing(false);
    setOpen(true);
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!isExpanded || !session) return;
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
  }, [isExpanded, session]);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) requestClose();
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", key);
    };
  }, [requestClose]);
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
        : ROUTES.volunteer.idCard;
  const addresses =
    role === "donor"
      ? ROUTES.donor.addresses
      : role === "ngo"
        ? ROUTES.ngo.addresses
        : undefined;
  let rowIndex = 0;
  const nextItemStyle = () => ({ "--item-index": rowIndex++ }) as CSSProperties;
  return (
    <div className="relative" ref={container}>
      <button
        type="button"
        aria-label={tx("Open account menu")}
        aria-expanded={isExpanded}
        aria-haspopup="dialog"
        onClick={handleToggle}
        className={cn(
          "liquid-glass-pill flex h-11 min-w-11 items-center justify-center gap-0.5 rounded-xl px-1.5 text-left transition-all duration-200 active:scale-95 min-[375px]:gap-1 min-[375px]:px-2 sm:w-auto sm:gap-2 sm:px-2.5",
          isExpanded &&
            "ring-2 ring-[var(--role-border)] shadow-md",
        )}
      >
        <span className="grid size-5.5 shrink-0 place-items-center rounded-full bg-[var(--role-soft)] text-[10px] font-bold text-[var(--role-ink)] min-[375px]:size-6">
          {initials}
        </span>
        <span className="hidden max-w-32 truncate text-xs font-bold sm:block">
          {name}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-3 shrink-0 text-[var(--role-ink)] opacity-80 transition-transform duration-200 min-[375px]:size-3.5",
            isExpanded && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={tx("User Account Settings")}
          data-closing={closing ? "true" : undefined}
          className={cn(
            theme.profilePopoverPanel,
            closing && theme.profilePopoverClosing,
            "fixed inset-x-3 top-16 z-50 grid max-h-[calc(100dvh-5rem)] gap-3 overflow-y-auto overscroll-contain rounded-2xl border border-white/85 bg-white/92 p-5 shadow-2xl backdrop-blur-2xl backdrop-saturate-180 sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-80",
          )}
        >
          <div className={theme.profilePopoverItem} style={nextItemStyle()}>
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
          {role === "volunteer" && (
            <div className={theme.profilePopoverItem} style={nextItemStyle()}>
              <VolunteerDutySwitch />
            </div>
          )}
          {verification && (
            <p
              className={cn(
                theme.profilePopoverItem,
                "liquid-glass-tile rounded-xl p-3 text-xs",
              )}
              style={nextItemStyle()}
            >
              {tx("Account verification:")}{" "}
              {tx(verification.toLowerCase().replaceAll("_", " "))}
            </p>
          )}
          {error && (
            <p
              role="status"
              className={cn(theme.profilePopoverItem, "text-xs text-amber-800")}
              style={nextItemStyle()}
            >
              {tx(error)}
            </p>
          )}
          <Link
            href={home}
            onClick={closeImmediate}
            className={cn(
              theme.profilePopoverItem,
              "liquid-glass-tile rounded-xl p-3 text-sm font-semibold transition-transform duration-150 hover:bg-white/95 active:scale-[0.98]",
            )}
            style={nextItemStyle()}
          >
            {tx("View account")}
          </Link>
          {addresses && (
            <Link
              href={addresses}
              onClick={closeImmediate}
              className={cn(
                theme.profilePopoverItem,
                "liquid-glass-tile rounded-xl p-3 text-sm font-semibold transition-transform duration-150 hover:bg-white/95 active:scale-[0.98]",
              )}
              style={nextItemStyle()}
            >
              {tx("Saved addresses & location pins")}
            </Link>
          )}
          <button
            type="button"
            onClick={() => void signOut()}
            className={cn(
              theme.profilePopoverItem,
              "flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-800 transition-transform duration-150 hover:bg-red-100/80 active:scale-[0.98]",
            )}
            style={nextItemStyle()}
          >
            <LogOut className="size-4" />
            {tx("Log out")}
          </button>
        </div>
      )}
    </div>
  );
}
