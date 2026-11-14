"use client";

import { useUiText } from "@/lib/i18n/use-ui-text";
import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
  error?: string;
  containerClassName?: string;
}

export function Checkbox({ label, description, error, id, containerClassName, className, ...props }: CheckboxProps) {
  const tx = useUiText();
  const generatedId = useId();
  const inputId = id ?? props.name ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;
  const describedBy = [props["aria-describedby"], description ? descriptionId : undefined, error ? errorId : undefined].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("grid gap-1.5", containerClassName)}>
      <label htmlFor={inputId} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-white p-4 transition hover:border-brand-200 hover:bg-brand-50/40">
        <input
          {...props}
          id={inputId}
          type="checkbox"
          aria-describedby={describedBy}
          aria-invalid={error ? true : props["aria-invalid"]}
          className={cn("mt-0.5 size-5 shrink-0 rounded border-line accent-brand-600", className)}
        />
        <span>
          <span className="block text-sm font-bold text-ink-900">{tx(label)}</span>
          {description && <span id={descriptionId} className="mt-1 block text-xs leading-5 text-muted-600">{tx(description)}</span>}
        </span>
      </label>
      {error && <span id={errorId} role="alert" className="text-xs text-danger">{tx(error)}</span>}
    </div>
  );
}
