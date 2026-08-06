import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export function Textarea({ label, hint, error, id, className, containerClassName, ...props }: TextareaProps) {
  const textareaId = id ?? props.name;
  return (
    <label htmlFor={textareaId} className={cn("grid gap-2", containerClassName)}>
      {label && <span className="text-sm font-bold text-ink-700">{label}</span>}
      <textarea
        id={textareaId}
        className={cn(
          "min-h-28 w-full resize-y rounded-control border bg-white px-4 py-3 text-sm text-ink-900 shadow-sm outline-none transition placeholder:text-muted-400",
          error ? "border-danger focus:border-danger" : "border-line focus:border-brand-500",
          className,
        )}
        {...props}
      />
      {(error || hint) && <span className={cn("text-xs", error ? "text-danger" : "text-muted-600")}>{error ?? hint}</span>}
    </label>
  );
}
