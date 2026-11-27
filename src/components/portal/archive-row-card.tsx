"use client";

import type { ReactNode } from "react";
import { ChevronRight, Eye } from "lucide-react";
import { getUiLocale } from "@/lib/i18n/locale";
import { useUiText } from "@/lib/i18n/use-ui-text";
import type { RescueProgressState } from "@/lib/rescue-progress";
import { cn } from "@/lib/utils";

export type ArchiveRowTone = "emerald" | "rose" | "amber";

export interface ArchiveProgressStep {
  id: string;
  label: string;
  done: boolean;
  current: boolean;
}

export interface ArchiveProgressSummary {
  state: RescueProgressState | "complete" | "cancelled" | "expired" | "paused" | "active" | "draft";
  stoppedAtLabel: string;
  completedSteps: number;
  steps: ReadonlyArray<ArchiveProgressStep>;
}

const ACCENT_RAIL_CLASS: Record<ArchiveRowTone, string> = {
  emerald: "bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600",
  rose: "bg-gradient-to-b from-rose-400 via-rose-500 to-rose-600",
  amber: "bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500",
};

const NUMBER_BADGE_CLASS: Record<ArchiveRowTone, string> = {
  emerald:
    "border-emerald-200/90 bg-gradient-to-br from-emerald-50 to-teal-100/80 text-emerald-900 shadow-2xs",
  rose:
    "border-rose-200/90 bg-gradient-to-br from-rose-50 to-rose-100/80 text-rose-900 shadow-2xs",
  amber:
    "border-amber-200/90 bg-gradient-to-br from-amber-50 to-orange-100/80 text-amber-900 shadow-2xs",
};

const PROGRESS_BADGE_CLASS: Record<ArchiveRowTone, string> = {
  emerald: "text-emerald-700",
  rose: "text-rose-700",
  amber: "text-amber-700",
};

export interface ArchiveRowCardProps {
  number: number;
  tone: ArchiveRowTone;
  title: string;
  statusBadge: ReactNode;
  referenceCode?: string;
  metaItems: ReactNode;
  progress: ArchiveProgressSummary;
  actionLabel?: string;
  onOpen: () => void;
}

/**
 * Executive 3-zone Bento Glass archive row with left outcome rail,
 * metadata pills, precision progress track, and popup action button.
 */
export function ArchiveRowCard({
  number,
  tone,
  title,
  statusBadge,
  referenceCode,
  metaItems,
  progress,
  actionLabel,
  onOpen,
}: ArchiveRowCardProps) {
  const tx = useUiText();
  const locale = getUiLocale();
  const total = progress.steps.length;
  const isStopped = progress.state !== "complete";

  return (
    <article className="liquid-glass-card group relative overflow-hidden rounded-[var(--radius-card)] p-4 sm:px-5 sm:py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white hover:shadow-lg">
      {/* Subtle Outcome Accent Rail */}
      <span
        aria-hidden="true"
        className={cn("absolute inset-y-3 left-0 w-1 rounded-r-full", ACCENT_RAIL_CLASS[tone])}
      />

      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between lg:gap-5 pl-1.5">
        {/* Zone 1: Index + Title + Badge + Logistics Meta */}
        <div className="flex min-w-0 flex-1 items-start gap-3.5 sm:items-center">
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-xl border text-xs font-black tabular-nums",
              NUMBER_BADGE_CLASS[tone],
            )}
          >
            {number.toLocaleString(locale)}
          </span>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm sm:text-[15px] font-extrabold tracking-tight text-slate-900">
                {title}
              </h3>
              {statusBadge}
              {referenceCode && (
                <span className="rounded-md border border-slate-200/80 bg-white/75 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-500">
                  {referenceCode}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] font-medium text-slate-600">
              {metaItems}
            </div>
          </div>
        </div>

        {/* Zone 2 & 3: Progress Telemetry Pod + Action CTA */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap lg:justify-end">
          {total > 0 && (
            <div className="w-full sm:w-52 rounded-xl border border-white/85 bg-white/65 px-3 py-2 shadow-2xs backdrop-blur-xs">
              <div className="mb-1.5 flex items-center justify-between gap-2 text-[10px] font-bold">
                <span className={cn("truncate", PROGRESS_BADGE_CLASS[tone])}>
                  {progress.state === "complete"
                    ? tx("All {0} steps completed", total)
                    : tx("Stopped at: {0}", tx(progress.stoppedAtLabel))}
                </span>
                <span className="shrink-0 font-black tabular-nums text-slate-700">
                  {tx("Step {0}/{1}", progress.completedSteps, total)}
                </span>
              </div>

              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
                aria-hidden="true"
              >
                {progress.steps.map((step) => {
                  const stoppedHere = isStopped && step.current;
                  return (
                    <span
                      key={step.id}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        stoppedHere
                          ? tone === "rose"
                            ? "bg-rose-600 shadow-[0_0_6px_rgba(225,29,72,0.45)]"
                            : "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.45)]"
                          : step.done
                            ? "bg-emerald-500"
                            : "bg-slate-200/90",
                      )}
                    />
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onOpen}
            className="inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/90 px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-[var(--role-border,var(--brand-300))] hover:bg-[var(--role-soft,var(--brand-50))] hover:text-[var(--role-ink,var(--brand-800))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--role-accent,var(--brand-600))]"
          >
            <Eye className="size-3.5 text-[var(--role-accent,var(--brand-600))]" />
            <span>{actionLabel ?? tx("View details")}</span>
            <ChevronRight className="size-3.5 opacity-60 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
