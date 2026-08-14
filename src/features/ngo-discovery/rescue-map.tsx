"use client";

import { useState } from "react";
import { Clock3, LocateFixed, MapPin, Navigation, ShieldCheck } from "lucide-react";
import { RescueClock } from "@/components/donor/rescue-clock";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FOOD_CATEGORY_LABELS, PriorityLevel } from "@/lib/constants/domain";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { NGODiscoveryItem } from "@/services";

const PIN_POSITIONS: Record<string, { left: string; top: string }> = {
  "donation-badda-pantry": { left: "54%", top: "62%" },
  "donation-uiu-bakery-snacks": { left: "71%", top: "42%" },
  "donation-banani-produce": { left: "24%", top: "27%" },
  "donation-banani-dairy": { left: "32%", top: "38%" },
  "donation-gulshan-buffet": { left: "58%", top: "28%" },
};

function fallbackPosition(index: number) {
  return { left: `${22 + (index * 17) % 64}%`, top: `${20 + (index * 23) % 60}%` };
}

export function RescueMap({ items }: { items: NGODiscoveryItem[] }) {
  const [selectedId, setSelectedId] = useState<string>();
  const selected = items.find((item) => item.donation.id === selectedId) ?? items[0];
  return <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_22rem]">
    <Card className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4"><div><p className="font-black text-ink-900">Approximate rescue map</p><p className="mt-1 text-xs text-muted-600">Area-level placement only—pins are intentionally offset from donor addresses.</p></div><div className="flex flex-wrap gap-2 text-xs font-bold"><span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-info" />NGO area</span><span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-brand-600" />Available</span><span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-danger" />Urgent</span></div></div>
      <div className="relative h-[32rem] overflow-hidden bg-gradient-to-br from-brand-50 via-white to-info-soft sm:h-[38rem]" aria-label="Approximate map of available food donations">
        <div className="absolute inset-x-[-10%] top-[24%] h-3 rotate-6 bg-white shadow-sm" /><div className="absolute inset-y-[-10%] left-[38%] w-3 -rotate-12 bg-white shadow-sm" /><div className="absolute inset-x-[-5%] top-[70%] h-2 -rotate-3 bg-white shadow-sm" /><div className="absolute inset-y-[-5%] left-[74%] w-2 rotate-12 bg-white shadow-sm" />
        <div className="absolute left-[46%] top-[47%] z-10 -translate-x-1/2 -translate-y-1/2 text-center"><span className="mx-auto grid size-12 place-items-center rounded-full bg-info text-white shadow-float ring-4 ring-white"><LocateFixed className="size-6" /></span><span className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-[11px] font-black text-info-strong shadow-sm">Hope Foundation service area</span></div>
        {items.map((item, index) => {
          const position = PIN_POSITIONS[item.donation.id] ?? fallbackPosition(index);
          const urgent = item.donation.priority === PriorityLevel.URGENT;
          const active = selected?.donation.id === item.donation.id;
          return <button key={item.donation.id} type="button" onClick={() => setSelectedId(item.donation.id)} aria-label={`Select ${item.donation.title} in ${item.donation.pickup.approximateArea}`} aria-pressed={active} className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={position}><span className={cn("grid size-11 place-items-center rounded-full text-white shadow-float ring-4 transition", urgent ? "bg-danger" : "bg-brand-600", active ? "scale-125 ring-accent-200" : "ring-white hover:scale-110")}><MapPin className="size-5" /></span><span className="mt-1 inline-block max-w-32 truncate rounded-full bg-white px-2 py-1 text-[10px] font-black text-ink-900 shadow-sm">{item.donation.pickup.approximateArea.split(",")[0]}</span></button>;
        })}
        {items.length === 0 && <div className="absolute inset-0 grid place-items-center p-6 text-center"><div><MapPin className="mx-auto size-10 text-muted-400" /><p className="mt-3 font-black text-ink-900">No pins match the current criteria</p><p className="mt-1 text-sm text-muted-600">Adjust the shared filters to repopulate the map.</p></div></div>}
        <div className="absolute bottom-4 left-4 right-4 z-30 flex items-start gap-3 rounded-2xl border border-info/20 bg-white/95 p-3 text-xs leading-5 text-info-strong shadow-card backdrop-blur"><ShieldCheck className="mt-0.5 size-4 shrink-0" /><p><span className="font-black">Privacy protected:</span> exact address, coordinates, contact, and directions stay hidden until a verified claim is accepted.</p></div>
      </div>
    </Card>
    <div className="grid content-start gap-4">{selected && <Card className="p-5"><div className="flex flex-wrap items-center gap-2"><Badge tone="success">{selected.matchScore}% match</Badge><Badge>{FOOD_CATEGORY_LABELS[selected.donation.category]}</Badge></div><h2 className="mt-3 text-xl font-black text-ink-900">{selected.donation.title}</h2><p className="mt-2 text-sm leading-6 text-muted-600">{selected.donorOrganization}</p><div className="mt-4 grid gap-2 text-xs"><p className="flex items-center gap-2 rounded-xl bg-brand-50 p-3"><Navigation className="size-4 text-brand-700" />{selected.donation.pickup.distanceKm?.toFixed(1)} km · {selected.donation.pickup.approximateArea}</p><p className="flex items-center gap-2 rounded-xl bg-brand-50 p-3"><Clock3 className="size-4 text-brand-700" />{selected.donation.quantity.estimatedMeals} estimated meals</p></div><div className="mt-4"><RescueClock deadline={selected.donation.safePickupDeadline} compact /></div><ButtonLink href={ROUTES.ngo.donation(selected.donation.id)} fullWidth className="mt-4">View donation</ButtonLink></Card>}
      <Card className="overflow-hidden"><div className="border-b border-line p-4"><p className="font-black text-ink-900">Nearby donation list</p><p className="mt-1 text-xs text-muted-600">Select a row to preview its approximate pin.</p></div><div className="max-h-80 divide-y divide-line overflow-y-auto">{items.map((item) => <button key={item.donation.id} type="button" onClick={() => setSelectedId(item.donation.id)} className={cn("flex w-full items-start gap-3 p-4 text-left transition hover:bg-brand-50", selected?.donation.id === item.donation.id && "bg-brand-50")}><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700"><MapPin className="size-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-black text-ink-900">{item.donation.title}</span><span className="mt-1 block text-xs text-muted-600">{item.donation.pickup.distanceKm?.toFixed(1)} km · {item.matchScore}% match</span></span></button>)}</div></Card>
    </div>
  </div>;
}
