"use client";

import { useUiText } from "@/lib/i18n/use-ui-text";
import { useId, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export function Select({ label, hint, error, id, className, containerClassName, children, ...props }: SelectProps) {
  const tx = useUiText();
  const generatedId = useId();
  const selectId = id ?? props.name ?? generatedId;
  const descriptionId = `${selectId}-description`;
  return (
    <label htmlFor={selectId} className={cn("grid min-w-0 gap-2", containerClassName)}>
      {label && <span className="text-sm font-bold text-ink-700">{tx(label)}</span>}
      <select
        {...props}
        id={selectId}
        aria-describedby={error || hint ? descriptionId : props["aria-describedby"]}
        aria-invalid={error ? true : props["aria-invalid"]}
        className={cn(
          "liquid-glass-control h-11 min-w-0 w-full rounded-control border px-3.5 text-sm text-ink-900 outline-none transition-all",
          error ? "border-danger focus:border-danger" : "border-white/80 ring-1 ring-slate-200/75 hover:border-white focus:border-brand-500 focus:ring-brand-500/20",
          className,
        )}
      >
        {children}
      </select>
      {(error || hint) && <span id={descriptionId} role={error ? "alert" : undefined} className={cn("text-xs", error ? "text-danger" : "text-muted-600")}>{tx(error ?? hint)}</span>}
    </label>
  );
}
