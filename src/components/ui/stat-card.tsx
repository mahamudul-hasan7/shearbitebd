import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "brand",
}: {
  label: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
  tone?: "brand" | "accent" | "info" | "success";
}) {
  const tones = {
    brand: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
    accent: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
    info: "bg-sky-50 text-sky-700 ring-1 ring-sky-600/20",
    success: "bg-teal-50 text-teal-700 ring-1 ring-teal-600/20",
  };

  return (
    <Card className="min-w-0 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border border-slate-200/80 bg-white">
      <div className="flex items-start justify-between gap-3">
        <span className={cn("grid size-11 place-items-center rounded-xl", tones[tone])}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        {helper && (
          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
            Active
          </span>
        )}
      </div>
      <p className="mt-4 break-words text-2xl font-black tabular-nums tracking-tight text-ink-900 lg:text-3xl">
        {value}
      </p>
      <p className="mt-1 break-words text-xs font-bold uppercase tracking-wider text-muted-600">
        {label}
      </p>
      {helper && <p className="mt-2 break-words text-xs text-muted-400 font-medium">{helper}</p>}
    </Card>
  );
}
