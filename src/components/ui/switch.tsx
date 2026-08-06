"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export function Switch({
  label,
  description,
  checked,
  defaultChecked = false,
  disabled = false,
  onCheckedChange,
  className,
}: {
  label: string;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}) {
  const labelId = useId();
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = checked ?? internalChecked;

  function toggle() {
    if (disabled) return;
    const next = !isChecked;
    if (checked === undefined) setInternalChecked(next);
    onCheckedChange?.(next);
  }

  return (
    <div className={cn("flex items-center justify-between gap-4 rounded-2xl border border-line bg-white p-4", disabled && "opacity-55", className)}>
      <div id={labelId}>
        <p className="text-sm font-bold text-ink-900">{label}</p>
        {description && <p className="mt-1 text-xs leading-5 text-muted-600">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-labelledby={labelId}
        disabled={disabled}
        onClick={toggle}
        className={cn("relative h-7 w-12 shrink-0 rounded-full transition", isChecked ? "bg-brand-600" : "bg-muted-400")}
      >
        <span className={cn("absolute top-1 size-5 rounded-full bg-white shadow-sm transition", isChecked ? "left-6" : "left-1")} />
      </button>
    </div>
  );
}
