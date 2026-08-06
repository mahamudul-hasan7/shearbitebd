import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuthProgressStep {
  label: string;
  shortLabel?: string;
}

export function AuthProgress({ steps, current }: { steps: AuthProgressStep[]; current: number }) {
  return (
    <ol className="grid grid-cols-4 gap-1" aria-label="Registration progress">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const complete = stepNumber < current;
        const active = stepNumber === current;
        return (
          <li key={step.label} className="relative flex min-w-0 flex-col items-center text-center">
            {index > 0 && (
              <span
                className={cn(
                  "absolute right-1/2 top-4 h-0.5 w-full -translate-x-[1px]",
                  stepNumber <= current ? "bg-brand-600" : "bg-line",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 grid size-8 place-items-center rounded-full border text-xs font-black transition",
                complete || active
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-line bg-white text-muted-600",
              )}
            >
              {complete ? <Check className="size-4" /> : stepNumber}
            </span>
            <span className={cn("mt-2 truncate text-[11px] font-bold sm:text-xs", active || complete ? "text-brand-700" : "text-muted-600")}>{step.shortLabel ?? step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
