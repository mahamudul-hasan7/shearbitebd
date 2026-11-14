"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { CalendarClock, RefreshCw } from "lucide-react";
import { useClock } from "@/lib/hooks/use-clock";
import { FOOD_CATEGORY_LABELS, STORAGE_CONDITION_LABELS, type FoodCategory, type StorageCondition } from "@/lib/constants/domain";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AiSpoilageMeterProps {
  category: FoodCategory; storageCondition: StorageCondition; foodCondition?: string;
  preparationTime?: string; safePickupDeadline?: string;
  onSyncCurrentTime?: (newPrepTime: string, newDeadline: string) => void; className?: string;
}
export function AiSpoilageMeter({ category, storageCondition, preparationTime, safePickupDeadline, onSyncCurrentTime, className }: AiSpoilageMeterProps) {
  const tx = useUiText();
  const now = useClock();
  const prepared = Date.parse(preparationTime || ""), deadline = Date.parse(safePickupDeadline || "");
  const minutes = now !== null && Number.isFinite(deadline) ? Math.ceil((deadline - now) / 60000) : undefined;
  const invalid = Number.isFinite(prepared) && Number.isFinite(deadline) && deadline <= prepared;
  function syncPreparation() {
    const current = new Date();
    const local = new Date(current.getTime() - current.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    onSyncCurrentTime?.(local, safePickupDeadline || "");
  }
  return <section aria-label={tx("Donor declared pickup window")} className={cn("grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5", className)}>
    <div className="flex items-center gap-2"><CalendarClock className="size-5 text-emerald-700" /><h3 className="font-bold">{tx("ঘোষিত pickup deadline")}</h3></div>
    <p className="text-sm">{tx(FOOD_CATEGORY_LABELS[category])} · {tx(STORAGE_CONDITION_LABELS[storageCondition])} {" "}{tx("(donor declared)")}</p>
    <p role="status" className={cn("text-sm font-bold", invalid || (minutes !== undefined && minutes <= 0) ? "text-red-700" : "text-emerald-800")}>
      {invalid ? tx("Pickup deadline must follow preparation time.") : minutes === undefined ? tx("Set a deadline to see the remaining pickup time.") : minutes <= 0 ? tx("Declared pickup deadline has passed.") : tx("{0} minutes until the donor-declared pickup deadline.", minutes)}
    </p>
    <p className="text-xs leading-5 text-muted-600">{tx("এটি আপনার দেওয়া সময় ও storage declaration। খাবারের freshness, temperature বা safety পরীক্ষা করা হয়নি। সঠিক deadline নির্ধারণ করুন এবং handover-এর সময় খাবার পরীক্ষা করুন।")}</p>
    {onSyncCurrentTime && <Button size="sm" variant="outline" leftIcon={<RefreshCw className="size-4" />} onClick={syncPreparation}>{tx("Set preparation time to now")}</Button>}
  </section>;
}
