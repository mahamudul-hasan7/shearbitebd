import { AlertTriangle, CheckCircle2, CircleAlert, Info, type LucideIcon } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AlertTone = "success" | "warning" | "danger" | "info";

const alertStyles: Record<AlertTone, { className: string; icon: LucideIcon }> = {
  success: { className: "border-success/20 bg-success-soft text-success-strong", icon: CheckCircle2 },
  warning: { className: "border-warning/25 bg-warning-soft text-warning-strong", icon: AlertTriangle },
  danger: { className: "border-danger/20 bg-danger-soft text-danger-strong", icon: CircleAlert },
  info: { className: "border-info/20 bg-info-soft text-info-strong", icon: Info },
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
  const style = alertStyles[tone];
  const Icon = style.icon;

  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("flex items-start gap-3 rounded-2xl border p-4", style.className, className)} {...props}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-bold">{title}</p>
        {description && <p className="mt-1 text-sm leading-6 opacity-85">{description}</p>}
      </div>
      {action}
    </div>
  );
}
