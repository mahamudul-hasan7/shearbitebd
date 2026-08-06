import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  containerClassName?: string;
}

export function Input({ label, hint, error, leftIcon, id, className, containerClassName, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? props.name ?? generatedId;
  const descriptionId = `${inputId}-description`;
  return (
    <label htmlFor={inputId} className={cn("grid gap-2", containerClassName)}>
      {label && <span className="text-sm font-bold text-ink-700">{label}</span>}
      <span className="relative block">
        {leftIcon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-600">{leftIcon}</span>
        )}
        <input
          {...props}
          id={inputId}
          aria-describedby={error || hint ? descriptionId : props["aria-describedby"]}
          aria-invalid={error ? true : props["aria-invalid"]}
          className={cn(
            "h-12 w-full rounded-control border bg-white px-4 text-sm text-ink-900 shadow-sm outline-none transition placeholder:text-muted-400",
            leftIcon ? "pl-11" : undefined,
            error ? "border-danger focus:border-danger" : "border-line focus:border-brand-500",
            className,
          )}
        />
      </span>
      {(error || hint) && (
        <span id={descriptionId} role={error ? "alert" : undefined} className={cn("text-xs", error ? "text-danger" : "text-muted-600")}>{error ?? hint}</span>
      )}
    </label>
  );
}
