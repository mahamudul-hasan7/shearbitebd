import { useId, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export function Select({ label, hint, error, id, className, containerClassName, children, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? props.name ?? generatedId;
  const descriptionId = `${selectId}-description`;
  return (
    <label htmlFor={selectId} className={cn("grid gap-2", containerClassName)}>
      {label && <span className="text-sm font-bold text-ink-700">{label}</span>}
      <select
        {...props}
        id={selectId}
        aria-describedby={error || hint ? descriptionId : props["aria-describedby"]}
        aria-invalid={error ? true : props["aria-invalid"]}
        className={cn(
          "h-12 w-full rounded-control border bg-white px-4 text-sm text-ink-900 shadow-sm outline-none transition",
          error ? "border-danger focus:border-danger" : "border-line focus:border-brand-500",
          className,
        )}
      >
        {children}
      </select>
      {(error || hint) && <span id={descriptionId} role={error ? "alert" : undefined} className={cn("text-xs", error ? "text-danger" : "text-muted-600")}>{error ?? hint}</span>}
    </label>
  );
}
