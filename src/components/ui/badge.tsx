import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "brand" | "accent" | "success" | "warning" | "danger" | "info" | "neutral";

const tones: Record<BadgeTone, string> = {
  brand: "bg-emerald-500/12 text-emerald-900 ring-1 ring-inset ring-emerald-500/25 backdrop-blur-sm shadow-[inset_0_1px_0_rgb(255_255_255/70%)]",
  accent: "bg-amber-500/14 text-amber-900 ring-1 ring-inset ring-amber-500/25 backdrop-blur-sm shadow-[inset_0_1px_0_rgb(255_255_255/70%)]",
  success: "bg-teal-500/12 text-teal-900 ring-1 ring-inset ring-teal-500/25 backdrop-blur-sm shadow-[inset_0_1px_0_rgb(255_255_255/70%)]",
  warning: "bg-amber-500/14 text-amber-900 ring-1 ring-inset ring-amber-500/25 backdrop-blur-sm shadow-[inset_0_1px_0_rgb(255_255_255/70%)]",
  danger: "bg-rose-500/12 text-rose-900 ring-1 ring-inset ring-rose-500/25 backdrop-blur-sm shadow-[inset_0_1px_0_rgb(255_255_255/70%)]",
  info: "bg-sky-500/12 text-sky-900 ring-1 ring-inset ring-sky-500/25 backdrop-blur-sm shadow-[inset_0_1px_0_rgb(255_255_255/70%)]",
  neutral: "bg-white/68 text-slate-800 ring-1 ring-inset ring-white/85 backdrop-blur-sm shadow-[inset_0_1px_0_rgb(255_255_255/85%)]",
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
