"use client";

import { Check } from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface StepperItem {
  label: string;
  description?: string;
}

export function Stepper({
  steps,
  current,
  label = "Progress",
  onStepClick,
}: {
  steps: StepperItem[];
  current: number;
  label?: string;
  onStepClick?: (step: number) => void;
}) {
  return (
    <ol
      aria-label={label}
      className="grid min-w-0 gap-3 sm:grid-cols-[repeat(var(--step-count),minmax(0,1fr))]"
      style={{ "--step-count": steps.length } as CSSProperties}
    >
      {steps.map((step, index) => {
        const number = index + 1;
        const complete = number < current;
        const active = number === current;
        const isClickable = Boolean(onStepClick && (complete || active));

        const content = (
          <div className="flex min-w-0 items-start gap-3 sm:block">
            {index > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute right-1/2 top-5 hidden h-0.5 w-full sm:block transition-colors",
                  number <= current ? "bg-emerald-600" : "bg-slate-200",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 grid size-10 shrink-0 place-items-center rounded-full border-2 text-sm font-black transition-all duration-200",
                complete
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm group-hover:scale-110 group-hover:shadow-md"
                  : active
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-md ring-4 ring-emerald-500/20 group-hover:scale-105"
                  : "border-slate-300 bg-white text-slate-500 shadow-2xs group-hover:border-slate-400",
              )}
            >
              {complete ? (
                <Check className="size-5" aria-hidden="true" />
              ) : (
                <span>{number}</span>
              )}
            </span>
            <span className="min-w-0 text-left sm:mt-3 sm:block">
              <span
                className={cn(
                  "block break-words text-sm font-bold transition-colors",
                  active
                    ? "text-emerald-950 font-black"
                    : complete
                    ? "text-emerald-800 group-hover:text-emerald-600"
                    : "text-slate-500",
                )}
              >
                {step.label}
              </span>
              {step.description && (
                <span className="mt-0.5 block break-words text-xs leading-5 text-slate-500 font-normal">
                  {step.description}
                </span>
              )}
            </span>
          </div>
        );

        return (
          <li
            key={step.label}
            aria-current={active ? "step" : undefined}
            className="relative"
          >
            {isClickable ? (
              <button
                type="button"
                onClick={() => onStepClick?.(number)}
                title={`ধাপ ${number}: ${step.label}-এ যান`}
                className="group w-full text-left cursor-pointer transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 rounded-xl"
              >
                {content}
              </button>
            ) : (
              <div className="w-full text-left">{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
