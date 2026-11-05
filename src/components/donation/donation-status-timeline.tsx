"use client";

import { AlertTriangle, Check, Clock, PackageCheck, Truck, Users, ShieldAlert, Sparkles } from "lucide-react";
import { DONATION_LIFECYCLE, DonationStatus } from "@/lib/constants/statuses";
import { STATUS_TEXT_BN } from "@/features/donations/donation-presentation";
import { cn } from "@/lib/utils";

const exceptionStatuses = new Set<DonationStatus>([
  DonationStatus.CANCELLED,
  DonationStatus.EXPIRED,
  DonationStatus.DISPUTED,
]);

const STAGE_ICONS: Partial<Record<DonationStatus, React.ComponentType<{ className?: string }>>> = {
  [DonationStatus.DRAFT]: Clock,
  [DonationStatus.PUBLISHED]: Sparkles,
  [DonationStatus.AVAILABLE]: Users,
  [DonationStatus.RESERVED]: PackageCheck,
  [DonationStatus.ASSIGNED]: Truck,
  [DonationStatus.PICKED_UP]: Truck,
  [DonationStatus.DELIVERED]: PackageCheck,
  [DonationStatus.DISTRIBUTED]: Check,
};

const EXCEPTION_DESCRIPTIONS: Record<string, string> = {
  [DonationStatus.CANCELLED]: "এই অনুদানটি বাতিল করা হয়েছে। নতুন কোনো এনজিও বা রাইডার এটি সংগ্রহ করতে পারবে না।",
  [DonationStatus.EXPIRED]: "নিরাপদ পিকআপের নির্ধারিত মেয়াদ শেষ হয়ে যাওয়ায় এই অনুদানটি স্বয়ংক্রিয়ভাবে বন্ধ হয়ে গেছে।",
  [DonationStatus.DISPUTED]: "একটি সমস্যা রিপোর্ট পর্যালোচনায় থাকায় সাধারণ লাইফসাইকেল সাময়িকভাবে স্থগিত রাখা হয়েছে।",
};

export function DonationStatusTimeline({ status, compact = false }: { status: DonationStatus; compact?: boolean }) {
  const currentIndex = DONATION_LIFECYCLE.indexOf(status);
  const isException = exceptionStatuses.has(status);

  return (
    <div className="w-full">
      {isException && (
        <div className="mb-5 flex items-start gap-3.5 rounded-2xl border border-danger/25 bg-danger-soft/70 p-4 text-sm text-danger-strong backdrop-blur-sm">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden="true" />
          <div>
            <p className="font-black text-ink-900">
              {STATUS_TEXT_BN[status] || status}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-600">
              {EXCEPTION_DESCRIPTIONS[status] || "অনুদানের স্বাভাবিক লাইফসাইকেল পরিবর্তন বা স্থগিত হয়েছে।"}
            </p>
          </div>
        </div>
      )}

      {/* Progress track */}
      <ol
        className={cn(
          "grid gap-2.5",
          compact
            ? "grid-cols-2 sm:grid-cols-4 xl:grid-cols-8"
            : "grid-cols-2 sm:grid-cols-4 xl:grid-cols-8"
        )}
        aria-label="Donation lifecycle progress"
      >
        {DONATION_LIFECYCLE.map((item, index) => {
          const complete = currentIndex >= 0 && index < currentIndex;
          const current = item === status;
          const StepIcon = STAGE_ICONS[item] || Clock;

          return (
            <li
              key={item}
              aria-current={current ? "step" : undefined}
              className={cn(
                "group relative min-w-0 rounded-2xl border p-3 transition-all duration-200",
                current
                  ? "border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20"
                  : complete
                  ? "border-emerald-200/80 bg-emerald-50/40 text-emerald-900"
                  : "border-line bg-canvas/60 text-muted-500"
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-xl text-[11px] font-black transition-all",
                    current
                      ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400"
                      : complete
                      ? "bg-emerald-600 text-white"
                      : "bg-surface-elevated text-muted-600 ring-1 ring-line"
                  )}
                >
                  {complete ? <Check className="size-3.5 stroke-[3]" /> : index + 1}
                </span>

                <StepIcon
                  className={cn(
                    "size-3.5 transition-colors",
                    current ? "text-emerald-700" : complete ? "text-emerald-600" : "text-muted-400"
                  )}
                />
              </div>

              <div className="mt-2 min-w-0">
                <p
                  className={cn(
                    "truncate text-xs font-bold leading-tight",
                    current ? "font-black text-emerald-950" : complete ? "font-bold text-ink-900" : "text-muted-500"
                  )}
                  title={STATUS_TEXT_BN[item]}
                >
                  {STATUS_TEXT_BN[item] || item}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-400">
                  ধাপ {index + 1}
                </p>
              </div>

              {current && (
                <div className="absolute -top-1 -right-1 flex size-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-emerald-500" />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
