import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "brand" | "accent" | "success" | "warning" | "danger" | "info" | "neutral";

const tones: Record<BadgeTone, string> = {
  brand: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-600/20",
  accent: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20",
  success: "bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-600/20",
  warning: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20",
  danger: "bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-600/20",
  info: "bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-600/20",
  neutral: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
};

export function Badge({ tone = "brand", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold font-heading tracking-wide",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
