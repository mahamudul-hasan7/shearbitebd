"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RealInteractiveMap } from "@/features/ngo-discovery/real-interactive-map";
import { ROUTES } from "@/lib/routes";
import type { NGODiscoveryItem } from "@/services";

export function RescueMap({ items }: { items: NGODiscoveryItem[] }) {
  const tx = useUiText();
  const [selectedId, setSelectedId] = useState<string>();
  const mapped = items.filter((item) => item.donation.pickup.approximateCoordinates);
  const selected = items.find((item) => item.donation.id === selectedId) || items[0];
  return <div className="grid min-w-0 gap-5">
    <Card><CardHeader title={tx("Available food locations")} description={tx("{0} mapped · {1} without a saved pin", mapped.length, items.length - mapped.length)} /><CardContent className="grid gap-3">
      <RealInteractiveMap items={items} selectedId={selected?.donation.id} onSelect={setSelectedId} />
      <p className="text-sm text-muted-600">{tx("এখানে donor-এর আনুমানিক এলাকা দেখানো হচ্ছে। Claim করলে সঠিক pickup pin ও navigation পাওয়া যাবে।")}</p>
      {items.length === 0 && <p role="status">{tx("No donations match these filters. Clear the distance filter to include food without a saved pin.")}</p>}
      {items.length > mapped.length && <p className="text-xs text-amber-800">{tx("Some donations have no saved location pin. They remain in the list below; no location has been guessed.")}</p>}
    </CardContent></Card>
    {selected && <Card><CardHeader title={selected.donation.title} description={selected.donorOrganization} /><CardContent className="grid gap-3">
      <p className="text-sm">{selected.donation.pickup.approximateArea} · {selected.donation.quantity.estimatedMeals} {" "}{tx("meals")}</p>
      <p className="text-sm text-muted-600">{selected.donation.pickup.distanceKm === undefined ? tx("Distance unavailable — primary NGO address and donor both need saved pins.") : tx("Approx. {0} km in a straight line from your primary NGO address.", selected.donation.pickup.distanceKm.toFixed(1))}</p>
      <ButtonLink href={ROUTES.ngo.donation(selected.donation.id)}>{tx("View donation & claim")}</ButtonLink>
    </CardContent></Card>}
    <Card><CardHeader title={tx("Food list ({0})", items.length)} /><CardContent><div className="grid max-h-80 gap-2 overflow-y-auto">
      {items.map(({ donation }) => <button type="button" key={donation.id} onClick={() => setSelectedId(donation.id)} className={`rounded-xl border p-3 text-left ${donation.id === selected?.donation.id ? "border-emerald-500 bg-emerald-50" : "border-slate-200"}`}><span className="block font-bold">{donation.title}</span><span className="mt-1 block text-xs text-muted-600">{donation.pickup.approximateArea} · {donation.quantity.estimatedMeals} {" "}{tx("meals ·")}{" "}{donation.pickup.approximateCoordinates ? tx("Approximate map pin") : tx("Pin not set")}{donation.pickup.distanceKm !== undefined ? tx("· ~{0} km straight line", donation.pickup.distanceKm.toFixed(1)) : ""}</span></button>)}
    </div></CardContent></Card>
  </div>;
}
