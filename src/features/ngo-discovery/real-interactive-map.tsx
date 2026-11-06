"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  ExternalLink,
  Flame,
  Layers,
  LocateFixed,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  PackageOpen,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { PriorityLevel } from "@/lib/constants/domain";
import { ROUTES } from "@/lib/routes";
import type { NGODiscoveryItem } from "@/services";

// Real geographic coordinates for Dhaka neighborhoods
const COORDINATE_MAP: Record<string, [number, number]> = {
  "donation-badda-pantry": [23.7804, 90.4264], // Middle Badda
  "donation-uiu-bakery-snacks": [23.7976, 90.4496], // UIU Campus, Madani Ave
  "donation-banani-produce": [23.7937, 90.4066], // Banani
  "donation-banani-dairy": [23.7915, 90.4035], // Banani
  "donation-gulshan-buffet": [23.7925, 90.4078], // Gulshan 1/2
  "donation-dhanmondi-kacchi": [23.7525, 90.3756], // Dhanmondi 27
  "donation-uttara-khichuri": [23.8712, 90.3984], // Sector 4, Uttara
  "donation-mirpur-bakery": [23.8071, 90.3686], // Mirpur 10
  "donation-karwan-produce": [23.7533, 90.3934], // Karwan Bazar
  "donation-mohakhali-dinner": [23.7776, 90.4054], // Mohakhali
};

const DHAKA_PRESETS: Array<{ id: string; nameBn: string; coords: [number, number]; zoom: number }> = [
  { id: "all", nameBn: "সমগ্র ঢাকা", coords: [23.7806, 90.415], zoom: 12 },
  { id: "badda", nameBn: "বাড্ডা ও ইউআইইউ", coords: [23.792, 90.44], zoom: 14 },
  { id: "gulshan", nameBn: "গুলশান ও বনানী", coords: [23.793, 90.407], zoom: 14 },
  { id: "dhanmondi", nameBn: "ধানমন্ডি", coords: [23.7525, 90.3756], zoom: 14 },
  { id: "uttara", nameBn: "উত্তরা", coords: [23.8712, 90.3984], zoom: 14 },
  { id: "mirpur", nameBn: "মিরপুর", coords: [23.8071, 90.3686], zoom: 14 },
];

export function RealInteractiveMap({
  items,
  selectedId,
  onSelect,
}: {
  items: NGODiscoveryItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Record<string, any>>({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activePreset, setActivePreset] = useState("all");

  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = await import("leaflet");

      if (isCancelled || !mapContainerRef.current) return;

      // Initialize Leaflet map centered on Dhaka
      const map = L.map(mapContainerRef.current, {
        center: [23.7806, 90.415],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // Add Zoom control at top right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Free OpenStreetMap CartoDB Voyager tiles (clean, beautiful, high-contrast, free forever)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
        }
      ).addTo(map);

      // Attribution
      L.control
        .attribution({ position: "bottomright", prefix: false })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> & CartoDB (100% Free)')
        .addTo(map);

      mapInstanceRef.current = map;
      setMapLoaded(true);
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when items or selectedId changes
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear previous markers
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};

      items.forEach((item, index) => {
        const donation = item.donation;
        const coords = COORDINATE_MAP[donation.id] || [
          23.75 + ((index * 0.035) % 0.12),
          90.38 + ((index * 0.04) % 0.09),
        ];

        const isUrgent = donation.priority === PriorityLevel.URGENT;
        const isSelected = donation.id === selectedId;

        // Custom HTML pulsating marker icon
        const markerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform ${isSelected ? "scale-125 z-50" : "scale-100 hover:scale-110"}">
            ${
              isUrgent
                ? '<div class="absolute -inset-2.5 rounded-full bg-rose-500/40 animate-ping"></div>'
                : isSelected
                ? '<div class="absolute -inset-2 rounded-full bg-emerald-500/40 animate-pulse"></div>'
                : ""
            }
            <div class="relative flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black text-white shadow-xl ${
              isUrgent
                ? "bg-rose-600 ring-2 ring-white"
                : isSelected
                ? "bg-emerald-700 ring-2 ring-white"
                : "bg-emerald-600 ring-1 ring-white/80"
            }">
              <span class="size-2 rounded-full ${isUrgent ? "bg-white animate-pulse" : "bg-emerald-200"}"></span>
              <span>${donation.quantity.estimatedMeals} মিল</span>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: "custom-leaflet-marker",
          iconSize: [80, 32],
          iconAnchor: [40, 16],
        });

        const marker = L.marker(coords, { icon }).addTo(map);

        // Popup content with Bengali info and direct claim link
        const popupContent = `
          <div style="font-family: inherit; min-width: 200px; padding: 4px;">
            <div style="font-size: 10px; font-weight: bold; color: ${isUrgent ? "#e11d48" : "#059669"}; text-transform: uppercase;">
              ${isUrgent ? "🚨 অতি জরুরি উদ্ধার" : "✓ খাদ্য লট প্রস্তুত"} · ${item.matchScore}% ম্যাচ
            </div>
            <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">
              ${donation.title}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
              ${item.donorOrganization} · ${donation.pickup.approximateArea}
            </div>
            <div style="margin-top: 6px; font-size: 11px; font-weight: bold; color: #0f172a;">
              🍱 ${donation.quantity.estimatedMeals} জনের আহার · ${donation.pickup.distanceKm?.toFixed(1) || "৩.২"} কিমি
            </div>
            <a href="/ngo/donations/${donation.id}" style="display: block; text-align: center; background: #059669; color: white; font-size: 11px; font-weight: bold; padding: 6px 10px; border-radius: 8px; margin-top: 8px; text-decoration: none;">
              বিস্তারিত দেখুন ও ক্লেইম করুন →
            </a>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on("click", () => {
          onSelect(donation.id);
        });

        markersRef.current[donation.id] = marker;
      });
    });
  }, [items, mapLoaded, selectedId, onSelect]);

  function handleFlyTo(preset: (typeof DHAKA_PRESETS)[number]) {
    setActivePreset(preset.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(preset.coords, preset.zoom, {
        duration: 1.2,
      });
    }
  }

  return (
    <div className="relative h-[38rem] w-full overflow-hidden rounded-2xl bg-slate-100">
      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Top Floating Zone Navigation Ribbon */}
      <div className="absolute left-3 top-3 z-10 flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/95 p-1.5 shadow-md backdrop-blur-md">
        <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          এলাকা:
        </span>
        {DHAKA_PRESETS.map((preset) => {
          const active = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleFlyTo(preset)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                active
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {preset.nameBn}
            </button>
          );
        })}
      </div>

      {/* Free Real Map Attribution Badge in bottom left */}
      <div className="absolute bottom-3 left-3 z-10 hidden sm:flex items-center gap-2 rounded-xl border border-emerald-600/20 bg-emerald-950/85 px-3 py-1.5 text-xs text-white shadow-lg backdrop-blur-md">
        <span className="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-bold text-emerald-200">১০০% ফ্রি ওপেনস্ট্রিটম্যাপ (OpenStreetMap Live)</span>
        <span className="text-white/60">· রিয়েল ঢাকা রোড নেটওয়ার্ক</span>
      </div>
    </div>
  );
}
