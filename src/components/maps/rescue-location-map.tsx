"use client";

import { useEffect, useMemo, useState } from "react";
import { Navigation, Play, Square, Route } from "lucide-react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { LocationMap, type MapLocation } from "@/components/maps/location-map";
import { Button } from "@/components/ui/button";
import { distanceKm, navigationUrl } from "@/lib/locations";
import type { Coordinates } from "@/types/domain";

interface RouteSummary {
  path: Coordinates[];
  distanceKm: number;
  durationMin: number;
  source: "osrm" | "straight";
}

export function RescueLocationMap({
  pickup,
  delivery,
  pickupLabel,
  deliveryLabel,
}: {
  pickup?: Coordinates;
  delivery?: Coordinates;
  pickupLabel: string;
  deliveryLabel?: string;
}) {
  const tx = useUiText();
  const [savedRoute, setSavedRoute] = useState<{ key: string; route: RouteSummary }>();
  const [simulating, setSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);

  const points: MapLocation[] = useMemo(() => {
    const list: MapLocation[] = [];
    if (pickup)
      list.push({
        id: "pickup",
        coordinates: pickup,
        label: tx("Pickup"),
        description: pickupLabel,
      });
    if (delivery)
      list.push({
        id: "delivery",
        coordinates: delivery,
        label: tx("Delivery"),
        description: deliveryLabel,
      });
    return list;
  }, [pickup, delivery, pickupLabel, deliveryLabel, tx]);

  const routeKey = pickup && delivery
    ? `${pickup.latitude},${pickup.longitude}:${delivery.latitude},${delivery.longitude}`
    : undefined;
  const fallback = useMemo<RouteSummary | undefined>(() => {
    if (!pickup || !delivery) return undefined;
    const straightKm = distanceKm(pickup, delivery);
    return {
      path: [pickup, delivery],
      distanceKm: straightKm,
      durationMin: Math.max(4, Math.round(straightKm * 3.2)),
      source: "straight",
    };
  }, [pickup, delivery]);
  const route = savedRoute?.key === routeKey ? savedRoute?.route : fallback;

  useEffect(() => {
    if (!pickup || !delivery || !routeKey) return;
    const controller = new AbortController();
    const straightKm = distanceKm(pickup, delivery);
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${pickup.longitude},${pickup.latitude};${delivery.longitude},${delivery.latitude}?overview=full&geometries=geojson`,
      { signal: controller.signal },
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const first = json?.routes?.[0];
        const coords: [number, number][] | undefined =
          first?.geometry?.coordinates;
        if (!controller.signal.aborted && Array.isArray(coords) && coords.length >= 2) {
          setSavedRoute({ key: routeKey, route: {
            path: coords.map(([lon, lat]) => ({
              latitude: lat,
              longitude: lon,
            })),
            distanceKm: (first.distance ?? straightKm * 1000) / 1000,
            durationMin: Math.max(1, Math.round((first.duration ?? 600) / 60)),
            source: "osrm",
          } });
        }
      })
      .catch(() => {
        // Keep straight-line fallback gracefully if offline.
      });

    return () => controller.abort();
  }, [pickup, delivery, routeKey]);

  const sampledPath = useMemo(() => {
    if (!route?.path || route.path.length < 2) return [];
    if (route.path.length >= 20) return route.path;
    const [a, b] = route.path;
    const steps = 24;
    return Array.from({ length: steps + 1 }, (_, i) => ({
      latitude: a.latitude + ((b.latitude - a.latitude) * i) / steps,
      longitude: a.longitude + ((b.longitude - a.longitude) * i) / steps,
    }));
  }, [route]);

  useEffect(() => {
    if (!simulating || sampledPath.length < 2) return;
    const timer = window.setInterval(() => {
      setSimStep((prev) => (prev + 1) % sampledPath.length);
    }, 350);
    return () => window.clearInterval(timer);
  }, [simulating, sampledPath]);

  const riderCoordinates =
    simulating && sampledPath.length > 0 ? sampledPath[simStep % sampledPath.length] : undefined;

  return (
    <section className="grid gap-3" aria-label={tx("Rescue locations")}>
      {route && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2 font-semibold text-emerald-950">
            <Route className="size-4 text-emerald-700" />
            <span>
              {route.source === "osrm"
                ? tx("Road route (OSRM)")
                : tx("Estimated route")}
              : <strong>{route.distanceKm.toFixed(1)} km</strong> · ~
              <strong>{route.durationMin} min</strong>
            </span>
          </div>
          {sampledPath.length > 1 && (
            <Button
              type="button"
              size="sm"
              variant={simulating ? "primary" : "outline"}
              leftIcon={
                simulating ? (
                  <Square className="size-3.5" />
                ) : (
                  <Play className="size-3.5" />
                )
              }
              onClick={() => {
                setSimStep(0);
                setSimulating((prev) => !prev);
              }}
            >
              {simulating ? tx("Stop rider sim") : tx("Simulate live rider")}
            </Button>
          )}
        </div>
      )}

      {points.length > 0 && (
        <LocationMap
          points={points}
          routePath={route?.path}
          riderCoordinates={riderCoordinates}
          label={tx("Pickup and delivery map")}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/70 p-4">
          <h3 className="text-sm font-bold text-emerald-950">
            {tx("P · Pickup")}
          </h3>
          <p className="mt-1 text-sm text-emerald-900">{pickupLabel}</p>
          {!pickup && (
            <p className="mt-2 text-xs text-amber-800">
              {tx("Pickup pin not saved. Coordinate the location by phone.")}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 p-4">
          <h3 className="text-sm font-bold text-amber-950">
            {tx("D · Delivery")}
          </h3>
          <p className="mt-1 text-sm text-amber-900">
            {deliveryLabel || tx("Delivery destination pending")}
          </p>
          {!delivery && (
            <p className="mt-2 text-xs text-amber-800">
              {tx("Delivery pin not saved.")}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-sm font-bold text-emerald-800">
        {pickup && (
          <a
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 text-brand-800 hover:bg-emerald-50"
            href={navigationUrl(pickup)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Navigation className="size-4" />
            {tx("Navigate to pickup ↗")}
          </a>
        )}
        {delivery && (
          <a
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 text-brand-800 hover:bg-emerald-50"
            href={navigationUrl(delivery, pickup)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Navigation className="size-4" />
            {tx("Pickup to delivery directions ↗")}
          </a>
        )}
      </div>
    </section>
  );
}
