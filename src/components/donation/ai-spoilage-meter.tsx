"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { CalendarClock, Flame, RefreshCw, ShieldCheck, Snowflake, Thermometer } from "lucide-react";
import { useClock } from "@/lib/hooks/use-clock";
import { FOOD_CATEGORY_LABELS, STORAGE_CONDITION_LABELS, type FoodCategory, type StorageCondition } from "@/lib/constants/domain";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AiSpoilageMeterProps {
  category: FoodCategory;
  storageCondition: StorageCondition;
  foodCondition?: string;
  preparationTime?: string;
  safePickupDeadline?: string;
  onSyncCurrentTime?: (newPrepTime: string, newDeadline: string) => void;
  className?: string;
}

export function AiSpoilageMeter({
  category,
  storageCondition,
  preparationTime,
  safePickupDeadline,
  onSyncCurrentTime,
  className,
}: AiSpoilageMeterProps) {
  const tx = useUiText();
  const now = useClock();
  const prepared = Date.parse(preparationTime || "");
  const deadline = Date.parse(safePickupDeadline || "");
  const minutes = now !== null && Number.isFinite(deadline) ? Math.ceil((deadline - now) / 60000) : undefined;
  const totalWindow = Number.isFinite(prepared) && Number.isFinite(deadline) && deadline > prepared
    ? Math.max(30, Math.ceil((deadline - prepared) / 60000))
    : 180;
  const invalid = Number.isFinite(prepared) && Number.isFinite(deadline) && deadline <= prepared;

  const safetyPct = invalid
    ? 0
    : minutes === undefined
      ? 65
      : minutes <= 0
        ? 0
        : Math.max(8, Math.min(100, Math.round((minutes / totalWindow) * 100)));

  const risk = invalid || (minutes !== undefined && minutes <= 0)
    ? { label: "Expired / Invalid Window", badge: "bg-red-100 text-red-800 border-red-200", bar: "bg-red-500", text: "text-red-700" }
    : safetyPct >= 60
      ? { label: "Optimal Freshness", badge: "bg-emerald-100 text-emerald-800 border-emerald-200", bar: "bg-gradient-to-r from-emerald-500 to-teal-400", text: "text-emerald-800" }
      : safetyPct >= 30
        ? { label: "Urgent Dispatch Window", badge: "bg-amber-100 text-amber-800 border-amber-200", bar: "bg-gradient-to-r from-amber-500 to-orange-400", text: "text-amber-800" }
        : { label: "Critical Rescue Window", badge: "bg-rose-100 text-rose-800 border-rose-200", bar: "bg-gradient-to-r from-rose-500 to-red-500", text: "text-rose-700" };

  const StorageIcon = storageCondition === "REFRIGERATED" || storageCondition === "FROZEN"
    ? Snowflake
    : storageCondition === "HOT_HOLDING"
      ? Flame
      : Thermometer;

  function syncPreparation() {
    const current = new Date();
    const local = new Date(current.getTime() - current.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    onSyncCurrentTime?.(local, safePickupDeadline || "");
  }

  return (
    <section
      aria-label={tx("Donor declared pickup window")}
      className={cn("grid gap-3.5 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/35 to-slate-50 p-5 shadow-xs", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-600/10 text-emerald-700">
            <CalendarClock className="size-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-ink-900">{tx("ঘোষিত pickup deadline")}</h3>
            <p className="flex items-center gap-1.5 text-xs text-muted-600">
              <StorageIcon className="size-3.5 text-emerald-700" />
              <span>{tx(FOOD_CATEGORY_LABELS[category])} · {tx(STORAGE_CONDITION_LABELS[storageCondition])}</span>
            </p>
          </div>
        </div>
        <span className={cn("rounded-full border px-2.5 py-1 text-xs font-bold", risk.badge)}>
          {tx(risk.label)}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span role="status" className={risk.text}>
            {invalid
              ? tx("Pickup deadline must follow preparation time.")
              : minutes === undefined
                ? tx("Set a deadline to see the remaining pickup time.")
                : minutes <= 0
                  ? tx("Declared pickup deadline has passed.")
                  : tx("{0} minutes until the donor-declared pickup deadline.", minutes)}
          </span>
          <span className="font-mono text-muted-600">{safetyPct}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
          <div
            className={cn("h-full rounded-full transition-all duration-300", risk.bar)}
            style={{ width: `${safetyPct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
        <p className="flex items-center gap-1.5 text-xs leading-5 text-muted-600">
          <ShieldCheck className="size-3.5 shrink-0 text-emerald-700" />
          <span>{tx("সময় ও storage declaration অনুযায়ী নিরাপদ পিকআপ উইন্ডো দেখানো হচ্ছে।")}</span>
        </p>
        {onSyncCurrentTime && (
          <Button size="sm" variant="outline" leftIcon={<RefreshCw className="size-3.5" />} onClick={syncPreparation}>
            {tx("Set preparation time to now")}
          </Button>
        )}
      </div>
    </section>
  );
}
