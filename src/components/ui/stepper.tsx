import { Check } from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface StepperItem {
  label: string;
  description?: string;
}

export function Stepper({ steps, current, label = "Progress" }: { steps: StepperItem[]; current: number; label?: string }) {
  return (
    <ol aria-label={label} className="grid gap-3 sm:grid-cols-[repeat(var(--step-count),minmax(0,1fr))]" style={{ "--step-count": steps.length } as CSSProperties}>
      {steps.map((step, index) => {
        const number = index + 1;
        const complete = number < current;
        const active = number === current;
        return (
          <li key={step.label} aria-current={active ? "step" : undefined} className="relative flex min-w-0 items-start gap-3 sm:block">
            {index > 0 && <span aria-hidden="true" className={cn("absolute right-1/2 top-5 hidden h-0.5 w-full sm:block", number <= current ? "bg-brand-600" : "bg-line")} />}
            <span className={cn("relative z-10 grid size-10 shrink-0 place-items-center rounded-full border text-sm font-black", complete || active ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white text-muted-600")}>
              {complete ? <Check className="size-5" aria-hidden="true" /> : number}
            </span>
            <span className="min-w-0 sm:mt-3 sm:block">
              <span className={cn("block text-sm font-bold", active || complete ? "text-brand-800" : "text-muted-600")}>{step.label}</span>
              {step.description && <span className="mt-1 block text-xs leading-5 text-muted-600">{step.description}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
