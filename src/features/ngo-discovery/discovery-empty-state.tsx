"use client";

import { useEffect, useMemo, useState } from "react";
import { BellRing, SearchX } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { DIETARY_TYPE_LABELS, FOOD_CATEGORY_LABELS, PRIORITY_META, STORAGE_CONDITION_LABELS } from "@/lib/constants/domain";
import type { DiscoveryFilters } from "@/features/ngo-discovery/types";
import { ROUTES } from "@/lib/routes";

const NOTIFY_KEY = "sharebite.ngo.discovery-notify";

export function DiscoveryEmptyState({ filters, resetFilters }: { filters: DiscoveryFilters; resetFilters: () => void }) {
  const [notify, setNotify] = useState(false);
  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => setNotify(window.sessionStorage.getItem(NOTIFY_KEY) === "true"), 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);
  const criteria = useMemo(() => {
    const values = [`Within ${filters.radiusKm} km`];
    if (filters.search) values.push(`Search: “${filters.search}”`);
    if (filters.category !== "ALL") values.push(FOOD_CATEGORY_LABELS[filters.category]);
    if (filters.dietary !== "ALL") values.push(DIETARY_TYPE_LABELS[filters.dietary]);
    if (filters.minMeals) values.push(`${filters.minMeals}+ meals`);
    if (filters.urgency !== "ALL") values.push(`${PRIORITY_META[filters.urgency].label} priority`);
    if (filters.storage !== "ALL") values.push(STORAGE_CONDITION_LABELS[filters.storage]);
    if (filters.deadlineHours) values.push(`Deadline within ${filters.deadlineHours}h`);
    return values;
  }, [filters]);
  function updateNotify(value: boolean) { setNotify(value); window.sessionStorage.setItem(NOTIFY_KEY, String(value)); }
  return <Card className="grid place-items-center p-6 text-center sm:p-10"><span className="grid size-16 place-items-center rounded-3xl bg-brand-100 text-brand-700"><SearchX className="size-8" /></span><h2 className="mt-5 text-2xl font-black text-ink-900">No donations match right now</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-600">Adjust your criteria, view all available donations, or create a verified food request.</p><div className="mt-5 flex max-w-2xl flex-wrap justify-center gap-2">{criteria.map((value) => <span key={value} className="rounded-full bg-canvas px-3 py-1.5 text-xs font-bold text-muted-600 ring-1 ring-line">{value}</span>)}</div><div className="mt-6 flex flex-wrap justify-center gap-3"><Button onClick={resetFilters}>View all donations</Button><ButtonLink href={ROUTES.ngo.newRequest} variant="outline">Create food request</ButtonLink></div><div className="mt-7 w-full max-w-xl border-t border-line pt-5"><Switch label="Notify me when matching food is available" description="Frontend-only preference for this browser tab; no real notification is sent." checked={notify} onCheckedChange={updateNotify} /><p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-500"><BellRing className="size-4" />You can change this later by returning to an empty discovery result.</p></div></Card>;
}
