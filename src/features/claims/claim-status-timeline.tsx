"use client";

import { BookmarkCheck, PackageCheck, Truck, UsersRound, UserRoundCheck } from "lucide-react";
import { ClaimStatus, STATUS_META } from "@/lib/constants/statuses";
import {
  claimProgressMessage,
  claimProgressMessageBn,
  claimStatusLabelBn,
  formatClaimDateTime,
  formatClaimDateTimeBn,
  isClaimStepComplete,
} from "@/features/claims/claim-presentation";
import { Alert } from "@/components/ui/alert";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";
import type { Claim } from "@/types/domain";

const STEP_META = {
  [ClaimStatus.RESERVED]: {
    icon: BookmarkCheck,
    timestamp: "reservedAt" as const,
    labelBn: "সংরক্ষিত",
  },
  [ClaimStatus.ASSIGNED]: {
    icon: UserRoundCheck,
    timestamp: "assignedAt" as const,
    labelBn: "ভলান্টিয়ার নির্ধারিত",
  },
  [ClaimStatus.PICKED_UP]: {
    icon: Truck,
    timestamp: "pickedUpAt" as const,
    labelBn: "সংগ্রহ সম্পন্ন",
  },
  [ClaimStatus.DELIVERED]: {
    icon: PackageCheck,
    timestamp: "deliveredAt" as const,
    labelBn: "ডেলিভারি প্রাপ্ত",
  },
  [ClaimStatus.DISTRIBUTED]: {
    icon: UsersRound,
    timestamp: "distributedAt" as const,
    labelBn: "বিতরণ সম্পন্ন",
  },
} as const;

const CLAIM_STEPS = [
  ClaimStatus.RESERVED,
  ClaimStatus.ASSIGNED,
  ClaimStatus.PICKED_UP,
  ClaimStatus.DELIVERED,
  ClaimStatus.DISTRIBUTED,
] as const;

export function ClaimStatusTimeline({ claim }: { claim: Claim }) {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const exception = [ClaimStatus.CANCELLED, ClaimStatus.EXPIRED, ClaimStatus.DISPUTED].includes(claim.status);

  return (
    <div className="grid gap-4">
      <ol
        aria-label={isBn ? "উদ্ধার কার্যক্রম অগ্রগতি" : "Claim progress"}
        className="grid gap-3 sm:grid-cols-5"
      >
        {CLAIM_STEPS.map((step, index) => {
          const meta = STEP_META[step];
          const Icon = meta.icon;
          const complete = isClaimStepComplete(claim.status, step);
          const current = claim.status === step;
          const timestamp = claim[meta.timestamp];

          return (
            <li key={step} className="relative">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute right-1/2 top-6 hidden h-0.5 w-full sm:block",
                    complete ? "bg-emerald-500" : "bg-slate-200",
                  )}
                />
              )}
              <div
                className={cn(
                  "relative z-10 grid h-full justify-items-center rounded-2xl border p-3 text-center transition",
                  current
                    ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                    : complete
                      ? "border-slate-200 bg-white"
                      : "border-slate-200 bg-slate-50/50 opacity-70",
                )}
              >
                <span
                  className={cn(
                    "grid size-11 place-items-center rounded-full border transition",
                    complete
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                      : "border-slate-200 bg-slate-100 text-slate-400",
                    current ? "ring-4 ring-emerald-100" : undefined,
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <p
                  className={cn(
                    "mt-2 text-xs font-black sm:text-sm",
                    complete ? "text-emerald-950" : "text-slate-500",
                  )}
                >
                  {isBn ? meta.labelBn : STATUS_META[step].label}
                </p>
                <p className="mt-1 text-[11px] leading-4 text-slate-500">
                  {isBn ? formatClaimDateTimeBn(timestamp) : formatClaimDateTime(timestamp)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <Alert
        tone={
          exception
            ? claim.status === ClaimStatus.DISPUTED
              ? "danger"
              : "warning"
            : "info"
        }
        title={isBn ? claimStatusLabelBn(claim.status) : STATUS_META[claim.status].label}
        description={isBn ? claimProgressMessageBn(claim) : claimProgressMessage(claim)}
      />
    </div>
  );
}
