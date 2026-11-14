"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { LocationMap, type MapLocation } from "@/components/maps/location-map";
import type { NGODiscoveryItem } from "@/services";

export function RealInteractiveMap({ items, selectedId, onSelect }: { items: NGODiscoveryItem[]; selectedId?: string; onSelect: (id: string) => void }) {
  const tx = useUiText();
  const points: MapLocation[] = items.flatMap(({ donation, donorOrganization }) => {
    const point = donation.pickup.approximateCoordinates;
    return point ? [{ id: donation.id, coordinates: point, label: donation.title, description: `${donorOrganization} · ${donation.pickup.approximateArea} · ${donation.quantity.estimatedMeals} meals`, approximate: true }] : [];
  });
  return <LocationMap points={points} selectedId={selectedId} onSelect={onSelect} className="h-[30rem]" label={tx("Available donations map")} />;
}
