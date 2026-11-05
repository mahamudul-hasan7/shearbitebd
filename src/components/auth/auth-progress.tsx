import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuthProgressStep {
  label: string;
  shortLabel?: string;
  subtitle?: string;
}

export function AuthProgress({ steps, current }: { steps: AuthProgressStep[]; current: number }) {
  return (
    <ol className="grid grid-cols-4 gap-2 mb-7" aria-label="Registration progress">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const complete = stepNumber < current;
        const active = stepNumber === current;
        return (
          <li key={step.label} className="relative flex min-w-0 flex-col items-center text-center">
            {index > 0 && (
              <span
                className={cn(
                  "absolute right-1/2 top-4 h-0.5 w-full -translate-x-[1px] transition-colors duration-300",
                  stepNumber <= current ? "bg-emerald-600" : "bg-slate-200",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 grid size-8 place-items-center rounded-full text-xs font-black transition-all shadow-xs font-heading",
                complete
                  ? "bg-emerald-600 text-white"
                  : active
                  ? "bg-emerald-600 text-white ring-4 ring-emerald-500/20 scale-105"
                  : "border-2 border-slate-200 bg-white text-slate-400",
              )}
            >
              {complete ? <Check className="size-4 stroke-[2.5]" /> : stepNumber}
            </span>
            <span
              className={cn(
                "mt-2 text-center text-[11px] leading-tight font-heading transition-colors sm:text-xs",
                active ? "font-black text-slate-900" : complete ? "font-bold text-emerald-700" : "font-medium text-slate-400",
              )}
            >
              {step.shortLabel ?? step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
