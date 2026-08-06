import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "brand" | "accent" | "success" | "warning" | "danger" | "info" | "neutral";

const tones: Record<BadgeTone, string> = {
  brand: "bg-brand-100 text-brand-800",
  accent: "bg-accent-100 text-accent-600",
  success: "bg-success-soft text-success-strong",
  warning: "bg-warning-soft text-warning-strong",
  danger: "bg-danger-soft text-danger-strong",
  info: "bg-info-soft text-info-strong",
  neutral: "bg-canvas text-muted-600 ring-1 ring-line",
};

export function Badge({ tone = "brand", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold", tones[tone], className)}
      {...props}
    />
  );
}
