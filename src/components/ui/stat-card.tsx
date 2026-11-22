import { UiText } from "@/lib/i18n/ui-text-node";
import type { LucideIcon } from "lucide-react";
import type { HTMLAttributes } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ActionGlyph,
  type LiveIconMotion,
} from "@/components/motion/live-icon";

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "brand",
  badge,
  motion = "interaction",
  className,
  ...props
}: {
  label: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
  tone?: "brand" | "accent" | "info" | "success";
  badge?: string;
  motion?: LiveIconMotion;
} & HTMLAttributes<HTMLDivElement>) {
  const tones = {
    brand:
      "bg-[var(--role-soft,var(--brand-50))] text-[var(--role-ink,var(--brand-700))] ring-1 ring-[var(--role-border,var(--brand-200))]",
    accent: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
    info: "bg-sky-50 text-sky-700 ring-1 ring-sky-600/20",
    success: "bg-teal-50 text-teal-700 ring-1 ring-teal-600/20",
  };

  return (
    <Card
      data-tone={tone}
      data-live-trigger="true"
      {...props}
      className={cn(
        "min-w-0 p-3.5 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border border-slate-200/80 bg-white",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "grid size-9 sm:size-11 place-items-center rounded-xl",
            tones[tone],
          )}
        >
          <ActionGlyph motion={motion}>
            <Icon className="size-4 sm:size-5" aria-hidden="true" />
          </ActionGlyph>
        </span>
        {badge && (
          <span className="inline-flex items-center text-[10px] sm:text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
            <UiText source={badge} />
          </span>
        )}
      </div>
      <p className="mt-2.5 sm:mt-4 break-words text-xl sm:text-2xl font-black tabular-nums tracking-tight text-ink-900 lg:text-3xl font-heading">
        {value}
      </p>
      <p className="mt-1 break-words text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-600 font-heading">
        <UiText source={label} />
      </p>
      {helper && (
        <p className="mt-1 sm:mt-2 break-words text-[11px] sm:text-xs text-slate-600 font-normal">
          <UiText source={helper} />
        </p>
      )}
    </Card>
  );
}
