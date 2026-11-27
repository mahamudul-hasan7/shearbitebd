"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { AlertTriangle, CheckCircle2, CircleAlert, Info, type LucideIcon } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AlertTone = "success" | "warning" | "danger" | "info";

const alertStyles: Record<AlertTone, { className: string; icon: LucideIcon }> = {
  success: { className: "border-emerald-300/60 bg-emerald-50/72 text-success-strong backdrop-blur-md shadow-[inset_0_1px_0_rgb(255_255_255/75%)]", icon: CheckCircle2 },
  warning: { className: "border-amber-300/65 bg-amber-50/74 text-warning-strong backdrop-blur-md shadow-[inset_0_1px_0_rgb(255_255_255/75%)]", icon: AlertTriangle },
  danger: { className: "border-rose-300/60 bg-rose-50/74 text-danger-strong backdrop-blur-md shadow-[inset_0_1px_0_rgb(255_255_255/75%)]", icon: CircleAlert },
  info: { className: "border-sky-300/60 bg-sky-50/72 text-info-strong backdrop-blur-md shadow-[inset_0_1px_0_rgb(255_255_255/75%)]", icon: Info },
};

export function Alert({
  title,
  description,
  tone = "info",
  action,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: string;
  tone?: AlertTone;
  action?: ReactNode;
}) {
  const tx = useUiText();
  const style = alertStyles[tone];
  const Icon = style.icon;

  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("flex items-start gap-3 rounded-card border p-4", style.className, className)} {...props}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{tx(title)}</p>
        {description && <p className="mt-1 text-sm leading-5 opacity-85">{tx(description)}</p>}
      </div>
      {action}
    </div>
  );
}
