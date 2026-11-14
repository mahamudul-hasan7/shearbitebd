"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { LocationMap, type MapLocation } from "@/components/maps/location-map";
import { distanceKm, navigationUrl } from "@/lib/locations";
import type { Coordinates } from "@/types/domain";

export function RescueLocationMap({ pickup, delivery, pickupLabel, deliveryLabel }: { pickup?: Coordinates; delivery?: Coordinates; pickupLabel: string; deliveryLabel?: string }) {
  const tx = useUiText();
  const points: MapLocation[] = [];
  if (pickup) points.push({ id: "pickup", coordinates: pickup, label: tx("Pickup"), description: pickupLabel });
  if (delivery) points.push({ id: "delivery", coordinates: delivery, label: tx("Delivery"), description: deliveryLabel });
  return <section className="grid gap-3" aria-label={tx("Rescue locations")}>
    {points.length > 0 && <LocationMap points={points} label={tx("Pickup and delivery map")} />}
    <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-emerald-50 p-4"><h3 className="text-sm font-bold">{tx("P · Pickup")}</h3><p className="mt-1 text-sm">{pickupLabel}</p>{!pickup && <p className="mt-2 text-xs text-amber-800">{tx("Pickup pin not saved. Coordinate the location by phone.")}</p>}</div><div className="rounded-xl bg-amber-50 p-4"><h3 className="text-sm font-bold">{tx("D · Delivery")}</h3><p className="mt-1 text-sm">{deliveryLabel || "Delivery destination pending"}</p>{!delivery && <p className="mt-2 text-xs text-amber-800">{tx("Delivery pin not saved.")}</p>}</div></div>
    {pickup && delivery && <p className="text-sm text-muted-600">{tx("Straight-line distance:")}{" "}{distanceKm(pickup, delivery).toFixed(1)} {" "}{tx("km. Road distance and travel time depend on your navigation app.")}</p>}
    <div className="flex flex-wrap gap-3 text-sm font-bold text-emerald-800">{pickup && <a href={navigationUrl(pickup)} target="_blank" rel="noopener noreferrer">{tx("Navigate to pickup ↗")}</a>}{delivery && <a href={navigationUrl(delivery, pickup)} target="_blank" rel="noopener noreferrer">{tx("Pickup to delivery directions ↗")}</a>}</div>
    <p className="text-xs text-muted-600">{tx("Saved handover pins. Volunteer GPS tracking is not connected.")}</p>
  </section>;
}
