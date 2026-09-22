import type { NGOImpactPeriod } from "@/services";

const PERIODS: Array<{ value: NGOImpactPeriod; label: string }> = [
  { value: "WEEK", label: "7 days" },
  { value: "MONTH", label: "30 days" },
  { value: "YEAR", label: "1 year" },
];

export function ImpactPeriodTabs({ value, onChange }: { value: NGOImpactPeriod; onChange: (period: NGOImpactPeriod) => void }) {
  return <div role="tablist" aria-label="Impact date range" className="flex gap-1 rounded-2xl border border-line bg-white p-1.5 shadow-sm">{PERIODS.map((period) => <button key={period.value} type="button" role="tab" aria-selected={value === period.value} onClick={() => onChange(period.value)} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${value === period.value ? "bg-brand-600 text-white" : "text-muted-600 hover:bg-brand-50"}`}>{period.label}</button>)}</div>;
}
