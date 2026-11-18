"use client";

import { useUiText } from "@/lib/i18n/use-ui-text";
import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  hint,
  error,
  leftIcon,
  rightElement,
  id,
  className,
  containerClassName,
  ...props
}: InputProps) {
  const tx = useUiText();
  const generatedId = useId();
  const inputId = id ?? props.name ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const nativeDatePicker = ["date", "datetime-local", "time"].includes(
    props.type ?? "",
  );
  return (
    <div className={cn("grid min-w-0 content-start gap-2", containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-bold text-ink-700">
          {tx(label)}
        </label>
      )}
      <span className="relative block min-w-0 group">
        {leftIcon && (
          <span
            className={cn(
              "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-600 transition-all duration-300 group-hover:scale-110 group-focus-within:scale-115 group-focus-within:text-brand-700",
              nativeDatePicker && "max-[359px]:hidden",
            )}
          >
            {leftIcon}
          </span>
        )}
        <input
          {...props}
          placeholder={props.placeholder ? tx(props.placeholder) : undefined}
          id={inputId}
          aria-describedby={
            error || hint ? descriptionId : props["aria-describedby"]
          }
          aria-invalid={error ? true : props["aria-invalid"]}
          className={cn(
            "h-11 min-w-0 w-full rounded-control border bg-white px-3.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-muted-400",
            leftIcon ? "pl-11" : undefined,
            rightElement ? "pr-14" : undefined,
            Boolean(leftIcon) && nativeDatePicker && "max-[359px]:pl-3.5",
            error
              ? "border-danger focus:border-danger"
              : "border-line hover:border-muted-400 focus:border-brand-500",
            className,
          )}
        />
        {rightElement && (
          <span className="absolute right-1 top-1/2 -translate-y-1/2">
            {rightElement}
          </span>
        )}
      </span>
      {(error || hint) && (
        <span
          id={descriptionId}
          role={error ? "alert" : undefined}
          className={cn("text-xs", error ? "text-danger" : "text-muted-600")}
        >
          {tx(error ?? hint)}
        </span>
      )}
    </div>
  );
}
