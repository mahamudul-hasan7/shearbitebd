"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bike,
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
  Radio,
  RefreshCw,
  Route,
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

// Route waypoints along Dhaka streets: UIU Badda -> Madani Ave -> Rampura Hope Foundation
const RESCUE_ROUTE_WAYPOINTS: Array<[number, number]> = [
  [23.7976, 90.4496], // UIU Campus Gate
  [23.7950, 90.4430], // 100 Feet / Madani Ave West
  [23.7910, 90.4350], // Notun Bazar Connector
  [23.7850, 90.4300], // Badda Link Road
  [23.7804, 90.4264], // Middle Badda Bazar
  [23.7740, 90.4240], // Hatirjheel Eastern Ramp
  [23.7680, 90.4225], // Rampura Bridge
  [23.7614, 90.4208], // Hope Foundation Center, Rampura
];

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const riderMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routePolylineRef = useRef<any>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [activePreset, setActivePreset] = useState("all");
  const [locatingUser, setLocatingUser] = useState(false);
  const [liveRiderActive, setLiveRiderActive] = useState(false);
  const [riderStep, setRiderStep] = useState(0);

  // 1. Initialize Map
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

  // 2. Update Food Donation Markers when items or selectedId changes
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
          <div style="font-family: inherit; min-width: 220px; padding: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; font-weight: bold; color: ${isUrgent ? "#e11d48" : "#059669"}; text-transform: uppercase;">
              <span>${isUrgent ? "🚨 অতি জরুরি উদ্ধার" : "✓ খাদ্য লট প্রস্তুত"}</span>
              <span style="background: #ecfdf5; padding: 2px 6px; border-radius: 6px; color: #047857;">${item.matchScore}% ম্যাচ</span>
            </div>
            <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 4px;">
              ${donation.title}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
              📍 ${item.donorOrganization} · ${donation.pickup.approximateArea}
            </div>
            <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; color: #0f172a;">
              <span>🍱 ${donation.quantity.estimatedMeals} জনের খাবার</span>
              <span style="color: #059669;">~${donation.pickup.distanceKm?.toFixed(1) || "৩.২"} কিমি</span>
            </div>
            <a href="/ngo/donations/${donation.id}" style="display: block; text-align: center; background: #059669; color: white; font-size: 11px; font-weight: bold; padding: 7px 10px; border-radius: 8px; margin-top: 8px; text-decoration: none;">
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

  // 3. Live Rider Simulation Effect (Street Polyline & Moving Vehicle)
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !liveRiderActive) {
      if (riderMarkerRef.current) {
        riderMarkerRef.current.remove();
        riderMarkerRef.current = null;
      }
      if (routePolylineRef.current) {
        routePolylineRef.current.remove();
        routePolylineRef.current = null;
      }
      return;
    }

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Draw Route Polyline on real streets
      if (!routePolylineRef.current) {
        routePolylineRef.current = L.polyline(RESCUE_ROUTE_WAYPOINTS, {
          color: "#059669",
          weight: 5,
          opacity: 0.85,
          dashArray: "8, 8",
        }).addTo(map);

        map.flyToBounds(routePolylineRef.current.getBounds(), {
          padding: [50, 50],
          duration: 1.5,
        });
      }

      // Moving Rider Marker
      const currentPos = RESCUE_ROUTE_WAYPOINTS[riderStep];
      const riderHtml = `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="absolute -inset-3 rounded-full bg-emerald-500/30 animate-ping"></div>
          <div class="relative flex items-center gap-1.5 rounded-full bg-slate-900 border-2 border-emerald-400 px-2.5 py-1 text-white shadow-2xl">
            <span class="text-sm">🏍️</span>
            <span class="text-[10px] font-black font-mono text-emerald-300">LIVE RIDER</span>
          </div>
        </div>
      `;

      const riderIcon = L.divIcon({
        html: riderHtml,
        className: "custom-leaflet-rider",
        iconSize: [110, 32],
        iconAnchor: [55, 16],
      });

      if (!riderMarkerRef.current) {
        riderMarkerRef.current = L.marker(currentPos, { icon: riderIcon }).addTo(map);
      } else {
        riderMarkerRef.current.setLatLng(currentPos);
      }
    });

    const interval = setInterval(() => {
      setRiderStep((prev) => (prev + 1) % RESCUE_ROUTE_WAYPOINTS.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [mapLoaded, liveRiderActive, riderStep]);

  // 4. Locate User's Real Live GPS Position
  function handleLocateUser() {
    if (!navigator.geolocation || !mapInstanceRef.current) {
      alert("আপনার ব্রাউজারে জিপিএস লোকেশন সাপোর্ট করে না অথবা অনুমতি দেওয়া হয়নি।");
      return;
    }

    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingUser(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        import("leaflet").then((L) => {
          const map = mapInstanceRef.current;
          if (!map) return;

          // Remove previous user marker if any
          if (userMarkerRef.current) userMarkerRef.current.remove();

          const userHtml = `
            <div class="relative flex items-center justify-center">
              <div class="absolute -inset-4 rounded-full bg-blue-500/30 animate-ping"></div>
              <div class="relative size-4 rounded-full border-2 border-white bg-blue-600 shadow-xl"></div>
            </div>
          `;

          const userIcon = L.divIcon({
            html: userHtml,
            className: "custom-user-marker",
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          userMarkerRef.current = L.marker([lat, lng], { icon: userIcon }).addTo(map);
          userMarkerRef.current.bindPopup("<div style='font-weight:bold; font-size:12px;'>📍 আপনার বর্তমান লাইভ অবস্থান</div>").openPopup();

          map.flyTo([lat, lng], 15, { duration: 1.5 });
        });
      },
      (err) => {
        setLocatingUser(false);
        // Default to Dhaka center if permission denied
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([23.7806, 90.415], 14, { duration: 1.5 });
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }

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

      {/* Live Controls Toolbar (Top Right / Bottom Right) */}
      <div className="absolute right-3 top-14 z-10 flex flex-col items-end gap-2">
        {/* GPS Locate Me Button */}
        <button
          type="button"
          onClick={handleLocateUser}
          disabled={locatingUser}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-md backdrop-blur-md transition hover:bg-emerald-50 hover:text-emerald-800"
          title="আমার জিপিএস লাইভ অবস্থান দেখুন"
        >
          <LocateFixed className={`size-3.5 ${locatingUser ? "animate-spin text-emerald-600" : "text-blue-600"}`} />
          <span>{locatingUser ? "খোঁজা হচ্ছে..." : "আমার জিপিএস অবস্থান"}</span>
        </button>

        {/* Live Rider Tracking Simulator Toggle */}
        <button
          type="button"
          onClick={() => setLiveRiderActive((prev) => !prev)}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold shadow-md backdrop-blur-md transition ${
            liveRiderActive
              ? "border-emerald-500 bg-emerald-950 text-emerald-200"
              : "border-slate-200/90 bg-white/95 text-slate-800 hover:bg-emerald-50"
          }`}
          title="ভলান্টিয়ার রাইডারের লাইভ মুভমেন্ট ট্র্যাক করুন"
        >
          <Bike className={`size-3.5 ${liveRiderActive ? "text-emerald-400 animate-bounce" : "text-slate-600"}`} />
          <span>{liveRiderActive ? "লাইভ রাইডার সক্রিয়" : "লাইভ রাইডার ট্র্যাক করুন"}</span>
        </button>
      </div>

      {/* Free Real Map Attribution Badge in bottom left */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-600/20 bg-emerald-950/85 px-3 py-1.5 text-xs text-white shadow-lg backdrop-blur-md">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
        </span>
        <span className="font-bold text-emerald-200">লাইভ জিপিএস ও ওপেনস্ট্রিটম্যাপ</span>
        <span className="hidden sm:inline text-white/60">· ১০০% ফ্রি রিয়েল রোড নেটওয়ার্ক</span>
      </div>

      {/* Live Mission Telemetry HUD when Rider is active */}
      {liveRiderActive && (
        <div className="absolute bottom-3 right-3 z-10 hidden sm:flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-slate-950/90 p-2.5 text-xs text-white shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Radio className="size-4 text-emerald-400 animate-pulse" />
            <div>
              <p className="font-mono text-[10px] text-emerald-400 font-bold uppercase">মিশন #DH-8849</p>
              <p className="font-bold text-slate-100">ইউআইইউ ➔ রামপুরা মাস্তুল হাব</p>
            </div>
          </div>
          <div className="border-l border-slate-700 pl-3">
            <p className="text-[10px] text-slate-400">গতিবেগ / ETA</p>
            <p className="font-mono font-bold text-emerald-300">২৮ কিমি/ঘণ্টা · ৪ মিনিট</p>
          </div>
        </div>
      )}
    </div>
  );
}
