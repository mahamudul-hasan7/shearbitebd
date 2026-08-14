"use client";

import Link from "next/link";
import { List, Map, SlidersHorizontal } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DiscoveryFilterFields } from "@/features/ngo-discovery/discovery-filters";
import type { DiscoveryFilters, DiscoveryMode, DiscoverySort } from "@/features/ngo-discovery/types";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

function hrefFor(mode: DiscoveryMode, queryString: string) {
  const route = mode === "map" ? ROUTES.ngo.discoverMap : ROUTES.ngo.discover;
  return `${route}${queryString ? `?${queryString}` : ""}`;
}

export function DiscoveryControls({ mode, queryString, filters, activeFilterCount, resultCount, updateFilter, resetFilters }: { mode: DiscoveryMode; queryString: string; filters: DiscoveryFilters; activeFilterCount: number; resultCount: number; updateFilter: <K extends keyof DiscoveryFilters>(key: K, value: DiscoveryFilters[K]) => void; resetFilters: () => void }) {
  return <div className="grid gap-4">
    <div className="grid gap-3 rounded-card border border-line bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_13rem_auto]">
      <Input label="Search available food" value={filters.search} placeholder="Food, donor, or area…" onChange={(event) => updateFilter("search", event.target.value)} />
      <Select label="Sort results" value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value as DiscoverySort)}><option value="RECOMMENDED">Best match</option><option value="NEAREST">Nearest first</option><option value="DEADLINE">Deadline soonest</option><option value="QUANTITY">Largest quantity</option></Select>
      <div className="flex items-end gap-2"><div className="lg:hidden"><Drawer triggerLabel={`Filters${activeFilterCount ? ` (${activeFilterCount})` : ""}`} title="Discovery filters" description="Changes apply to both list and map views."><DiscoveryFilterFields filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} /></Drawer></div><nav aria-label="Discovery view" className="flex h-12 rounded-control border border-line bg-canvas p-1"><Link href={hrefFor("list", queryString)} aria-current={mode === "list" ? "page" : undefined} className={cn("grid size-10 place-items-center rounded-xl", mode === "list" ? "bg-brand-600 text-white" : "text-muted-600 hover:bg-white")} title="List view"><List className="size-5" /><span className="sr-only">List view</span></Link><Link href={hrefFor("map", queryString)} aria-current={mode === "map" ? "page" : undefined} className={cn("grid size-10 place-items-center rounded-xl", mode === "map" ? "bg-brand-600 text-white" : "text-muted-600 hover:bg-white")} title="Map view"><Map className="size-5" /><span className="sr-only">Map view</span></Link></nav></div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><p className="font-bold text-ink-700"><span className="text-brand-700">{resultCount}</span> available donation{resultCount === 1 ? "" : "s"} match your criteria</p>{activeFilterCount > 0 && <p className="flex items-center gap-2 text-muted-600"><SlidersHorizontal className="size-4" />{activeFilterCount} active filter{activeFilterCount === 1 ? "" : "s"}</p>}</div>
  </div>;
}
