import type { Coordinates } from "@/types/domain";

export function isCoordinates(value: unknown): value is Coordinates {
  if (!value || typeof value !== "object") return false;
  const point = value as Coordinates;
  return typeof point.latitude === "number" && Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90
    && typeof point.longitude === "number" && Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180;
}

export function coordinates(latitude: number | null | undefined, longitude: number | null | undefined): Coordinates | undefined {
  const point = { latitude, longitude };
  return isCoordinates(point) ? point : undefined;
}

// Unclaimed discoveries receive a roughly kilometre-sized grid location, never the saved exact pin.
export function approximateCoordinates(point: Coordinates): Coordinates {
  return { latitude: Math.round(point.latitude * 100) / 100, longitude: Math.round(point.longitude * 100) / 100 };
}

export function distanceKm(from: Coordinates, to: Coordinates): number {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const a = Math.sin(radians(to.latitude - from.latitude) / 2) ** 2
    + Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) * Math.sin(radians(to.longitude - from.longitude) / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a))) * 10) / 10;
}

export function navigationUrl(destination: Coordinates, origin?: Coordinates): string {
  const params = new URLSearchParams({ api: "1", destination: `${destination.latitude},${destination.longitude}`, travelmode: "driving" });
  if (origin) params.set("origin", `${origin.latitude},${origin.longitude}`);
  return `https://www.google.com/maps/dir/?${params}`;
}
