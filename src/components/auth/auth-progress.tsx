"use client";

import { useUiText } from "@/lib/i18n/use-ui-text";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuthProgressStep {
  label: string;
  shortLabel?: string;
  subtitle?: string;
}

export function AuthProgress({ steps, current }: { steps: AuthProgressStep[]; current: number }) {
  const tx = useUiText();
  return (
    <ol className="mb-1 grid grid-cols-4 gap-2" aria-label={tx("Registration progress")}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const complete = stepNumber < current;
        const active = stepNumber === current;
        return (
          <li key={step.label} aria-current={active ? "step" : undefined} className="relative flex min-w-0 flex-col items-center text-center">
            {index > 0 && (
              <span
                className={cn(
                  "absolute right-1/2 top-4 h-0.5 w-full -translate-x-[1px] transition-colors duration-300",
                  stepNumber <= current ? "bg-emerald-600" : "bg-emerald-950/12",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 grid size-8 place-items-center rounded-full text-xs font-black transition-all shadow-xs font-heading",
                complete
                  ? "bg-gradient-to-br from-[#022c22] to-[#059669] text-white"
                  : active
                  ? "bg-gradient-to-br from-[#022c22] to-[#059669] text-white ring-4 ring-emerald-500/25 scale-105"
                  : "border border-white/90 bg-white/75 text-slate-500 backdrop-blur-sm",
              )}
            >
              {complete ? <Check className="size-4 stroke-[2.5]" /> : stepNumber}
            </span>
            <span
              className={cn(
                "mt-1.5 text-center text-xs leading-snug font-heading transition-colors sm:text-xs",
                active ? "font-black text-slate-900" : complete ? "font-bold text-emerald-800" : "font-medium text-slate-500",
              )}
            >
              {tx(step.shortLabel ?? step.label)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
