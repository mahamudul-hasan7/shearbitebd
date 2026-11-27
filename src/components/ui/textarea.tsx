"use client";

import { useUiText } from "@/lib/i18n/use-ui-text";
import { useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export function Textarea({ label, hint, error, id, className, containerClassName, ...props }: TextareaProps) {
  const tx = useUiText();
  const generatedId = useId();
  const textareaId = id ?? props.name ?? generatedId;
  const descriptionId = `${textareaId}-description`;
  return (
    <label htmlFor={textareaId} className={cn("grid min-w-0 gap-2", containerClassName)}>
      {label && <span className="text-sm font-bold text-ink-700">{tx(label)}</span>}
      <textarea
        {...props}
          placeholder={props.placeholder ? tx(props.placeholder) : undefined}
        id={textareaId}
        aria-describedby={error || hint ? descriptionId : props["aria-describedby"]}
        aria-invalid={error ? true : props["aria-invalid"]}
        className={cn(
          "liquid-glass-control min-h-28 min-w-0 w-full resize-y rounded-control border px-3.5 py-3 text-sm text-ink-900 outline-none transition-all placeholder:text-muted-400",
          error ? "border-danger focus:border-danger" : "border-white/80 ring-1 ring-slate-200/75 hover:border-white focus:border-brand-500 focus:ring-brand-500/20",
          className,
        )}
      />
      {(error || hint) && <span id={descriptionId} role={error ? "alert" : undefined} className={cn("text-xs", error ? "text-danger" : "text-muted-600")}>{tx(error ?? hint)}</span>}
    </label>
  );
}
