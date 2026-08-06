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
    brand: "bg-brand-100 text-brand-700",
    accent: "bg-accent-100 text-accent-600",
    info: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <span className={cn("grid size-11 place-items-center rounded-2xl", tones[tone])}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        {helper && <ArrowUpRight className="size-4 text-brand-500" aria-hidden="true" />}
      </div>
      <p className="mt-5 text-3xl font-black tracking-tight text-ink-900">{value}</p>
      <p className="mt-1 text-sm font-bold text-ink-700">{label}</p>
      {helper && <p className="mt-2 text-xs text-muted-600">{helper}</p>}
    </Card>
  );
}
