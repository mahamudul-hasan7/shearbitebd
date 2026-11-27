"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import type { Coordinates } from "@/types/domain";
import { isCoordinates } from "@/lib/locations";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export interface MapLocation {
  id: string;
  coordinates: Coordinates;
  label: string;
  description?: string;
  approximate?: boolean;
}

interface Props {
  points: MapLocation[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  onChoose?: (point: Coordinates) => void;
  routePath?: Coordinates[];
  riderCoordinates?: Coordinates;
  className?: string;
  label?: string;
}

function acknowledgePin(element: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  element.getAnimations().forEach((animation) => animation.cancel());
  element.animate(
    [
      { transform: "translateY(0)" },
      { transform: "translateY(-5px)", offset: 0.4 },
      { transform: "translateY(0)" },
    ],
    { duration: 360, easing: "cubic-bezier(.2,.7,.3,1)" },
  );
}

export function LocationMap({
  points,
  selectedId,
  onSelect,
  onChoose,
  routePath,
  riderCoordinates,
  className = "h-80",
  label = "Location map",
}: Props) {
  const tx = useUiText();
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const leaflet = useRef<typeof Leaflet | null>(null);
  const callbacks = useRef({ onSelect, onChoose });
  const viewKey = useRef("");
  const lastSelected = useRef<string | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    callbacks.current = { onSelect, onChoose };
  }, [onSelect, onChoose]);

  useEffect(() => {
    let disposed = false;
    let observer: ResizeObserver | undefined;
    import("leaflet")
      .then((L) => {
        if (disposed || !container.current) return;
        leaflet.current = L;
        const instance = L.map(container.current, {
          scrollWheelZoom: false,
        }).setView([23.8103, 90.4125], 11);
        map.current = instance;
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        })
          .on("tileerror", () => {
            if (!disposed) setTileError(true);
          })
          .addTo(instance);
        instance.on("click", (event: Leaflet.LeafletMouseEvent) => {
          const wrapped = event.latlng.wrap();
          const point = {
            latitude: Number(wrapped.lat.toFixed(6)),
            longitude: Number(wrapped.lng.toFixed(6)),
          };
          if (isCoordinates(point)) callbacks.current.onChoose?.(point);
        });
        observer = new ResizeObserver(() => instance.invalidateSize());
        observer.observe(container.current);
        setReady(true);
      })
      .catch(() => {
        if (!disposed)
          setError(
            "Map could not load. Use the address and coordinates below, or reload to retry.",
          );
      });
    return () => {
      disposed = true;
      observer?.disconnect();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const L = leaflet.current,
      instance = map.current;
    if (!ready || !L || !instance) return;
    const group = L.layerGroup().addTo(instance);
    const valid = points.filter((point) => isCoordinates(point.coordinates));

    if (routePath && routePath.length >= 2) {
      const latLngs: Leaflet.LatLngTuple[] = routePath.map((c) => [
        c.latitude,
        c.longitude,
      ]);
      L.polyline(latLngs, {
        color: "#059669",
        weight: 5,
        opacity: 0.85,
        dashArray: "8 6",
      }).addTo(group);
    }

    for (const point of valid) {
      const position: Leaflet.LatLngTuple = [
        point.coordinates.latitude,
        point.coordinates.longitude,
      ];
      if (point.approximate)
        L.circle(position, {
          radius: 800,
          color: "#059669",
          weight: 1,
          fillOpacity: 0.08,
        }).addTo(group);
      const iconContent = document.createElement("span");
      iconContent.textContent =
        point.id === "pickup" ? "P" : point.id === "delivery" ? "D" : "●";
      iconContent.style.cssText = `display:grid;place-items:center;width:32px;height:32px;border:3px solid white;border-radius:50%;background:${point.id === selectedId ? "#b45309" : point.id === "delivery" ? "#2563eb" : "#047857"};color:white;font-weight:900;box-shadow:0 2px 8px #0006`;
      const marker = L.marker(position, {
        icon: L.divIcon({
          html: iconContent,
          className: "sharebite-location-pin",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        }),
        title: point.label,
        alt: point.label,
        draggable: Boolean(onChoose),
        keyboard: true,
      }).addTo(group);

      const popup = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = point.label;
      popup.append(title);
      if (point.description) {
        const text = document.createElement("p");
        text.textContent = point.description;
        popup.append(text);
      }
      if (point.approximate) {
        const text = document.createElement("p");
        text.textContent = tx(
          "Approximate area; exact pickup pin unlocks after claim.",
        );
        popup.append(text);
      }
      marker.bindPopup(popup);
      marker.on("click", () => {
        acknowledgePin(iconContent);
        callbacks.current.onSelect?.(point.id);
      });
      if (point.id === selectedId && lastSelected.current !== selectedId)
        acknowledgePin(iconContent);
      marker.on("dragend", () => {
        const value = marker.getLatLng().wrap();
        callbacks.current.onChoose?.({
          latitude: Number(value.lat.toFixed(6)),
          longitude: Number(value.lng.toFixed(6)),
        });
      });
    }

    if (riderCoordinates && isCoordinates(riderCoordinates)) {
      const riderEl = document.createElement("span");
      riderEl.textContent = "R";
      riderEl.style.cssText =
        "display:grid;place-items:center;width:34px;height:34px;border:3px solid #ffffff;border-radius:50%;background:#d97706;color:white;font-weight:900;box-shadow:0 0 0 6px rgba(217,119,6,0.28),0 4px 12px rgba(0,0,0,0.35);";
      L.marker([riderCoordinates.latitude, riderCoordinates.longitude], {
        icon: L.divIcon({
          html: riderEl,
          className: "sharebite-rider-pin",
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        }),
        title: tx("Volunteer rider"),
        zIndexOffset: 500,
      }).addTo(group);
    }

    const nextKey = JSON.stringify(
      valid.map((point) => [point.id, point.coordinates]),
    );
    if (nextKey !== viewKey.current && valid.length) {
      viewKey.current = nextKey;
      instance.fitBounds(
        L.latLngBounds(
          valid.map((point) => [
            point.coordinates.latitude,
            point.coordinates.longitude,
          ]),
        ),
        {
          padding: [40, 40],
          maxZoom: valid.some((point) => point.approximate) ? 13 : 16,
          animate: false,
        },
      );
    }
    const selected = valid.find((point) => point.id === selectedId);
    if (selected)
      instance.panTo(
        [selected.coordinates.latitude, selected.coordinates.longitude],
        {
          animate: !window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches,
        },
      );
    lastSelected.current = selectedId;
    return () => {
      group.remove();
    };
  }, [ready, points, selectedId, onChoose, routePath, riderCoordinates, tx]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <div
        ref={container}
        role="region"
        aria-label={tx(label)}
        data-testid="location-map"
        className={`relative z-0 w-full ${className}`}
      />
      {!ready && !error && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-slate-50">
          <LoadingSpinner label={tx("Loading map…")} />
        </div>
      )}
      {error && (
        <p role="alert" className="p-3 text-sm text-red-700">
          {tx(error)}
        </p>
      )}
      {tileError && (
        <p role="status" className="bg-amber-50 p-3 text-xs text-amber-900">
          {tx(
            "Map tiles could not load. Saved pins and address details are still available. Check your internet connection.",
          )}
        </p>
      )}
    </div>
  );
}
