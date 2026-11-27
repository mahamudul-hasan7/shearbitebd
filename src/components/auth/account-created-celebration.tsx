"use client";

import { useEffect, useState, type CSSProperties, type RefObject } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ButtonLink } from "@/components/ui/button";
import { AuthProgress } from "@/components/auth/auth-progress";
import { VerificationDocumentPanel } from "@/features/verification/document-panel";
import { getRoleLandingRoute } from "@/features/auth/mock-auth";
import type { RegistrationData, RegistrationRole } from "@/features/auth/types";
import { UserRole } from "@/lib/constants/roles";
import { ROUTES } from "@/lib/routes";
import { useUiText } from "@/lib/i18n/use-ui-text";
import styles from "./auth-pages.module.css";

const CONFETTI = [
  { tx: "-82px", ty: "-58px", rot: "-140deg", color: "#10b981", w: 8, h: 4, delay: "0.08s" },
  { tx: "86px", ty: "-54px", rot: "160deg", color: "#f59e0b", w: 7, h: 7, delay: "0.10s" },
  { tx: "-96px", ty: "8px", rot: "-95deg", color: "#34d399", w: 6, h: 6, delay: "0.14s" },
  { tx: "98px", ty: "14px", rot: "110deg", color: "#14b8a6", w: 9, h: 4, delay: "0.12s" },
  { tx: "-60px", ty: "-84px", rot: "-200deg", color: "#fbbf24", w: 6, h: 6, delay: "0.16s" },
  { tx: "60px", ty: "-86px", rot: "210deg", color: "#059669", w: 8, h: 4, delay: "0.18s" },
  { tx: "-68px", ty: "48px", rot: "-70deg", color: "#2dd4bf", w: 7, h: 4, delay: "0.15s" },
  { tx: "70px", ty: "50px", rot: "85deg", color: "#f59e0b", w: 6, h: 6, delay: "0.17s" },
  { tx: "0px", ty: "-92px", rot: "180deg", color: "#6ee7b7", w: 5, h: 9, delay: "0.11s" },
  { tx: "-36px", ty: "-72px", rot: "-120deg", color: "#38bdf8", w: 6, h: 6, delay: "0.19s" },
  { tx: "38px", ty: "-70px", rot: "130deg", color: "#34d399", w: 8, h: 4, delay: "0.13s" },
  { tx: "-44px", ty: "58px", rot: "-160deg", color: "#fbbf24", w: 5, h: 5, delay: "0.20s" },
] as const;

export function AccountCreatedCelebration({
  steps,
  role,
  userRole,
  roleLabel,
  data,
  sessionReady,
  headingRef,
}: {
  steps: { label: string; shortLabel: string }[];
  role: RegistrationRole;
  userRole: UserRole;
  roleLabel: string;
  data: RegistrationData;
  sessionReady: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const tx = useUiText();
  const [popupOpen, setPopupOpen] = useState(true);

  useEffect(() => {
    if (!popupOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPopupOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [popupOpen]);

  const statusText =
    role === "donor"
      ? tx("Active & Ready")
      : tx("Pending Document Review");

  const nextMilestone =
    role === "donor"
      ? tx("Post your first surplus batch")
      : tx("Upload verification document below");

  const targetHref = sessionReady
    ? getRoleLandingRoute(userRole)
    : ROUTES.auth.login;

  return (
    <div className="grid gap-6">
      <AuthProgress steps={steps} current={4} />

      {/* Silent Centered Celebration Popup Dialog (portaled out of backdrop-filter auth frame) */}
      {popupOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#022c22]/55 p-4 backdrop-blur-md animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-created-popup-title"
            onClick={() => setPopupOpen(false)}
          >
            <div
              className="animate-popup-pop relative flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/85 bg-white/95 backdrop-blur-2xl shadow-[0_28px_72px_rgba(2,44,34,0.38)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Branded Popup Header */}
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-emerald-100/80 bg-gradient-to-r from-emerald-50/70 via-white to-amber-50/40 px-6 py-4">
                <div className="scale-90 origin-left">
                  <BrandLogo variant="classic" />
                </div>
                <button
                  type="button"
                  onClick={() => setPopupOpen(false)}
                  aria-label={tx("বন্ধ করুন")}
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-slate-200/80 bg-white text-slate-500 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Body */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-5 pb-5 sm:px-7">
                {/* Animated Complete Emblem + Orbit + Confetti */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative grid size-24 place-items-center">
                    <span
                      aria-hidden="true"
                      className={`${styles.celebrationHalo} absolute inset-0 rounded-full border-2 border-emerald-400/80 bg-emerald-400/10`}
                    />
                    <span
                      aria-hidden="true"
                      className={`${styles.celebrationBreath} absolute inset-1 rounded-full bg-emerald-400/20 blur-md`}
                    />
                    <svg
                      viewBox="0 0 100 100"
                      aria-hidden="true"
                      className={`${styles.celebrationOrbit} absolute inset-0 size-full text-emerald-500/60`}
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="6 8"
                        strokeLinecap="round"
                      />
                    </svg>

                    {CONFETTI.map((c, idx) => (
                      <span
                        key={idx}
                        aria-hidden="true"
                        className={styles.confettiPiece}
                        style={
                          {
                            width: `${c.w}px`,
                            height: `${c.h}px`,
                            borderRadius: c.w === c.h ? "999px" : "2px",
                            backgroundColor: c.color,
                            "--tx": c.tx,
                            "--ty": c.ty,
                            "--rot": c.rot,
                            "--delay": c.delay,
                          } as CSSProperties
                        }
                      />
                    ))}

                    <div
                      className={`${styles.celebrationEmblem} relative grid size-18 place-items-center rounded-full bg-gradient-to-br from-[#022c22] via-[#047857] to-[#10b981] shadow-[0_14px_34px_rgba(5,150,105,0.38)] ring-4 ring-white`}
                    >
                      <svg viewBox="0 0 52 52" className="size-10 text-white" aria-hidden="true">
                        <circle
                          cx="26"
                          cy="26"
                          r="23"
                          fill="none"
                          stroke="rgba(255,255,255,0.28)"
                          strokeWidth="2.5"
                          className="animate-stroke-circle"
                        />
                        <path
                          d="M15 27 L22.5 34.5 L37 19"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="animate-stroke-check"
                        />
                      </svg>
                    </div>
                  </div>

                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                    <Sparkles className="size-3.5 text-emerald-600" />
                    <span>{tx("Welcome to ShareBite BD")}</span>
                  </span>

                  <h2
                    id="account-created-popup-title"
                    className="mt-2.5 text-2xl font-extrabold tracking-tight text-slate-900"
                  >
                    {tx("Your account is ready")}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {tx("Your account has been created successfully.")}
                  </p>
                </div>

                {/* Compact Executive Member Credential inside Popup */}
                <div
                  className={`${styles.passCard} mt-5 rounded-2xl border border-emerald-900/20 bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#0b3b30] p-4 text-white shadow-lg`}
                >
                  <div className={styles.passShimmer} aria-hidden="true" />
                  <div className="relative z-10 space-y-3 text-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-white/12 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="grid size-7 place-items-center rounded-lg bg-white/12 text-emerald-300">
                          <ShieldCheck className="size-4" />
                        </span>
                        <span className="font-bold text-white">{tx(roleLabel)}</span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-200">
                        <span className="size-1.5 rounded-full bg-emerald-400" />
                        {statusText}
                      </span>
                    </div>
                    <div className="grid gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-emerald-100/65">{tx("Account Holder")}</span>
                        <span className="truncate font-bold text-white">{data.fullName}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-emerald-100/65">{tx("Email")}</span>
                        <span className="truncate font-medium text-emerald-100">{data.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Glass Action Container Footer */}
              <div className="shrink-0 border-t border-slate-200/80 bg-gradient-to-b from-slate-50/90 to-emerald-50/35 px-6 py-4 sm:px-7">
                <div className="grid gap-2.5">
                  {role === "donor" ? (
                    <ButtonLink
                      href={targetHref}
                      size="lg"
                      className="w-full justify-center rounded-2xl"
                      rightIcon={
                        <ArrowRight className="size-4" />
                      }
                    >
                      {tx(sessionReady ? "Continue to dashboard" : "Sign in")}
                    </ButtonLink>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPopupOpen(false)}
                      className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#022c22] via-[#047857] to-[#059669] px-5 text-sm font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_26px_-6px_rgba(5,150,105,0.45)] hover:brightness-105 active:scale-[0.985] transition-[transform,filter,box-shadow] duration-150 cursor-pointer"
                    >
                      <span>{tx("Upload verification document")}</span>
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPopupOpen(false)}
                    className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-slate-200/90 bg-white px-4 text-xs font-bold text-slate-600 shadow-2xs hover:border-emerald-200 hover:bg-emerald-50/40 hover:text-emerald-900 transition cursor-pointer"
                  >
                    {tx("View member summary")}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Underlying Step 4 Page Summary */}
      <div className="flex items-center gap-3">
        <CheckCircle2 size={36} className="shrink-0 text-emerald-600" aria-hidden="true" />
        <div>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-extrabold tracking-tight text-ink-900"
          >
            {tx("Your account is ready")}
          </h1>
          <p className="mt-1 text-sm text-muted-600">
            {tx("Your account has been created successfully.")}
          </p>
        </div>
      </div>

      {/* Executive Digital Member Pass Card */}
      <div
        className={`${styles.passCard} rounded-2xl border border-emerald-900/20 bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#0b3b30] p-5 text-white shadow-[0_18px_42px_rgba(2,44,34,0.22)]`}
      >
        <div className={styles.passShimmer} aria-hidden="true" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/12 pb-3.5">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-white/12 text-emerald-300 ring-1 ring-white/20">
                <ShieldCheck className="size-4" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-300/90">
                  {tx("Member Credential")}
                </p>
                <p className="text-xs font-semibold text-white/90">{tx(roleLabel)}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-200">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              {statusText}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <UserRound className="size-4 shrink-0 text-emerald-300/80" />
              <div className="min-w-0">
                <p className="text-[11px] text-emerald-100/60">{tx("Account Holder")}</p>
                <p className="truncate font-bold text-white">{data.fullName}</p>
              </div>
            </div>
            {data.organizationName && (
              <div className="flex items-center gap-2.5 min-w-0">
                <Building2 className="size-4 shrink-0 text-emerald-300/80" />
                <div className="min-w-0">
                  <p className="text-[11px] text-emerald-100/60">{tx("Organization")}</p>
                  <p className="truncate font-bold text-white">{data.organizationName}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2.5 min-w-0">
              <Mail className="size-4 shrink-0 text-emerald-300/80" />
              <div className="min-w-0">
                <p className="text-[11px] text-emerald-100/60">{tx("Email")}</p>
                <p className="truncate font-medium text-emerald-50">{data.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 min-w-0">
              {data.phone ? (
                <Phone className="size-4 shrink-0 text-emerald-300/80" />
              ) : (
                <MapPin className="size-4 shrink-0 text-emerald-300/80" />
              )}
              <div className="min-w-0">
                <p className="text-[11px] text-emerald-100/60">
                  {data.phone ? tx("Phone") : tx("City")}
                </p>
                <p className="truncate font-medium text-emerald-50">
                  {data.phone || data.city || "Dhaka"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-white/12 pt-3 text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
              <CheckCircle2 className="size-3.5 shrink-0" />
              <span className="truncate">{tx("Registered")}</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-200 font-semibold">
              <span className="size-1.5 shrink-0 rounded-full bg-amber-300" />
              <span className="truncate">{nextMilestone}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/60">
              <span className="size-1.5 shrink-0 rounded-full bg-white/40" />
              <span className="truncate">{tx("Live Rescue")}</span>
            </div>
          </div>
        </div>
      </div>

      {role !== "donor" && (
        <Alert
          tone="info"
          title={tx("Account review pending")}
          description={tx(
            "Upload your document below. An administrator will review your account before you can claim or deliver food.",
          )}
        />
      )}
      {!sessionReady && (
        <Alert
          tone="info"
          title={tx("Sign in to continue")}
          description={tx(
            "Your account was created. Sign in with the details you just entered.",
          )}
        />
      )}

      {role !== "donor" && sessionReady && <VerificationDocumentPanel />}

      <ButtonLink
        href={targetHref}
        size="lg"
        rightIcon={<ArrowRight size={18} />}
        className="w-full justify-center rounded-2xl"
      >
        {tx(sessionReady ? "Continue to dashboard" : "Sign in")}
      </ButtonLink>
    </div>
  );
}
