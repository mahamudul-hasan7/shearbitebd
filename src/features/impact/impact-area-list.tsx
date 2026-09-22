import { MapPin } from "lucide-react";
import type { NGOImpactAnalytics } from "@/services";

export function ImpactAreaList({ areas }: { areas: NGOImpactAnalytics["topAreas"] }) {
  if (areas.length === 0) return <p className="rounded-2xl bg-canvas p-6 text-center text-sm text-muted-600">Areas appear after a distribution is recorded.</p>;
  return <div className="grid gap-3">{areas.map((area, index) => <div key={area.area} className="flex items-center gap-3 rounded-2xl border border-line p-4"><span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><MapPin className="size-5" /></span><div className="min-w-0 flex-1"><p className="font-black text-ink-900">{index + 1}. {area.area}</p><p className="mt-1 text-xs text-muted-600">{area.distributions} distributions</p></div><p className="text-sm font-black text-brand-800">{area.beneficiaries} people</p></div>)}</div>;
}
