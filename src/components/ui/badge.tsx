import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "brand" | "accent" | "success" | "warning" | "danger" | "info" | "neutral";

const tones: Record<BadgeTone, string> = {
  brand: "bg-brand-100 text-brand-800",
  accent: "bg-accent-100 text-accent-600",
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  neutral: "bg-slate-100 text-slate-700",
};

export function Badge({ tone = "brand", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold", tones[tone], className)}
      {...props}
    />
  );
}
