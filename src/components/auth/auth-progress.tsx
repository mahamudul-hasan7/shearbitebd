import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuthProgressStep {
  label: string;
  shortLabel?: string;
}

export function AuthProgress({ steps, current }: { steps: AuthProgressStep[]; current: number }) {
  return (
    <ol className="grid grid-cols-4 gap-2 mb-8" aria-label="Registration progress">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const complete = stepNumber < current;
        const active = stepNumber === current;
        return (
          <li key={step.label} className="relative flex min-w-0 flex-col items-center text-center">
            {index > 0 && (
              <span
                className={cn(
                  "absolute right-1/2 top-3.5 h-0.5 w-full -translate-x-[1px]",
                  stepNumber <= current ? "bg-emerald-600" : "bg-slate-200",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 grid size-7.5 place-items-center rounded-full text-xs font-bold transition-all shadow-2xs",
                complete
                  ? "bg-emerald-600 text-white"
                  : active
                  ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                  : "border border-slate-200 bg-white text-slate-400",
              )}
            >
              {complete ? <Check className="size-3.5" /> : stepNumber}
            </span>
            <span className={cn("mt-2 truncate text-[11px] font-semibold", active ? "text-slate-900 font-bold" : complete ? "text-emerald-700" : "text-slate-400")}>
              {step.shortLabel ?? step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
