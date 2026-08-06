import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function IconButton({ label, children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "grid size-11 place-items-center rounded-full border border-line bg-white text-brand-700 shadow-sm transition hover:bg-brand-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
