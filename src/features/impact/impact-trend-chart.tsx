import type { NGOImpactAnalytics } from "@/services";

export function ImpactTrendChart({ points }: { points: NGOImpactAnalytics["trend"] }) {
  if (points.length === 0) return <p className="rounded-2xl bg-canvas p-6 text-center text-sm text-muted-600">No completed distributions in this period.</p>;
  const max = Math.max(...points.map((point) => point.meals), 1);
  return <div className="flex min-h-56 items-end gap-3 overflow-x-auto pt-8" role="img" aria-label="Meals distributed over time">{points.map((point, index) => <div key={`${point.label}-${index}`} className="flex min-w-16 flex-1 flex-col items-center gap-2"><span className="text-xs font-black text-brand-800">{point.meals}</span><div className="w-full rounded-t-xl bg-gradient-to-t from-brand-700 to-brand-400" style={{ height: `${Math.max(18, (point.meals / max) * 150)}px` }} /><span className="text-center text-[11px] font-semibold text-muted-500">{point.label}</span></div>)}</div>;
}
