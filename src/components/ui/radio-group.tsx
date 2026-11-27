"use client";

import { useUiText } from "@/lib/i18n/use-ui-text";
import { useId, type ChangeEventHandler } from "react";
import { cn } from "@/lib/utils";

export interface RadioItem {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export function RadioGroup({
  label,
  name,
  items,
  value,
  defaultValue,
  onChange,
  orientation = "vertical",
  gridClassName,
  error,
  className,
}: {
  label: string;
  name: string;
  items: RadioItem[];
  value?: string;
  defaultValue?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  orientation?: "vertical" | "horizontal";
  gridClassName?: string;
  error?: string;
  className?: string;
}) {
  const tx = useUiText();
  const groupId = useId();
  const errorId = `${groupId}-error`;

  return (
    <fieldset aria-describedby={error ? errorId : undefined} className={className}>
      <legend className="text-sm font-bold text-ink-700">{tx(label)}</legend>
      <div className={cn("mt-2 grid gap-2", gridClassName ?? (orientation === "horizontal" && "sm:grid-cols-2 lg:grid-cols-3"))}>
        {items.map((item) => {
          const itemId = `${groupId}-${item.value}`;
          return (
            <label key={item.value} htmlFor={itemId} className={cn("liquid-glass-tile flex cursor-pointer items-start gap-3 rounded-2xl p-4 hover:border-brand-200", item.disabled && "cursor-not-allowed opacity-55")}>
              <input
                id={itemId}
                type="radio"
                name={name}
                value={item.value}
                checked={value === undefined ? undefined : value === item.value}
                defaultChecked={value === undefined ? defaultValue === item.value : undefined}
                disabled={item.disabled}
                onChange={onChange}
                className="mt-0.5 size-5 shrink-0 accent-brand-600"
              />
              <span>
                <span className="block text-sm font-bold text-ink-900">{tx(item.label)}</span>
                {item.description && <span className="mt-1 block text-xs leading-5 text-muted-600">{tx(item.description)}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {error && <p id={errorId} role="alert" className="mt-2 text-xs text-danger">{tx(error)}</p>}
    </fieldset>
  );
}
