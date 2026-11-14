"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationMap } from "@/components/maps/location-map";
import { isCoordinates } from "@/lib/locations";
import type { Coordinates } from "@/types/domain";

export function LocationPicker({ value, onChange }: { value?: Coordinates | null; onChange: (value: Coordinates | null) => void }) {
  const tx = useUiText();
  const [latitude, setLatitude] = useState(value ? String(value.latitude) : "");
  const [longitude, setLongitude] = useState(value ? String(value.longitude) : "");
  const [notice, setNotice] = useState("");
  const [locating, setLocating] = useState(false);
  function choose(point: Coordinates | null) {
    onChange(point); setLatitude(point ? String(point.latitude) : ""); setLongitude(point ? String(point.longitude) : ""); setNotice("");
  }
  function apply() {
    const point = { latitude: Number(latitude), longitude: Number(longitude) };
    if (!latitude.trim() || !longitude.trim() || !isCoordinates(point)) { setNotice("Enter both coordinates: latitude -90 to 90, longitude -180 to 180."); return; }
    choose(point);
  }
  function locate() {
    if (!window.isSecureContext || !navigator.geolocation) { setNotice("Device location needs HTTPS or localhost. You can click the map or enter coordinates instead."); return; }
    setLocating(true); setNotice("");
    navigator.geolocation.getCurrentPosition((position) => {
      choose({ latitude: Number(position.coords.latitude.toFixed(6)), longitude: Number(position.coords.longitude.toFixed(6)) });
      setNotice(`Device accuracy: approximately ${Math.round(position.coords.accuracy)} metres. Adjust the pin to the actual handover point, then save.`); setLocating(false);
    }, () => { setNotice("Device location unavailable or permission denied. Click the map or enter coordinates."); setLocating(false); }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
  }
  return <section className="grid gap-3" aria-label={tx("Location pin editor")}>
    <div><h3 className="font-bold">{tx("Location pin (optional)")}</h3><p className="mt-1 text-sm text-muted-600">{tx("মানচিত্রে ক্লিক করুন বা pin টেনে সঠিক handover point বেছে নিন। Save করলে ঠিকানার সাথে সংরক্ষিত হবে।")}</p></div>
    <LocationMap points={value ? [{ id: "address", coordinates: value, label: "Selected handover point" }] : []} onChoose={choose} label={tx("Choose handover location")} />
    <div className="grid gap-3 sm:grid-cols-2"><Input label={tx("Latitude")} inputMode="decimal" value={latitude} onChange={(event) => setLatitude(event.target.value)} hint={tx("After typing, click Apply coordinates.")} placeholder="23.7806" /><Input label={tx("Longitude")} inputMode="decimal" value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="90.4074" /></div>
    <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={apply}>{tx("Apply coordinates")}</Button><Button size="sm" variant="outline" disabled={locating} onClick={locate}>{locating ? tx("Locating…") : tx("Use device location")}</Button><Button size="sm" variant="ghost" onClick={() => choose(null)}>{tx("Clear pin")}</Button></div>
    <p className="text-xs text-muted-600">{value ? tx("Selected pin: {0}, {1}", value.latitude, value.longitude) : tx("No pin selected. This address will be usable as text but will not appear on the map.")}</p>
    {notice && <p role="status" className="text-sm text-amber-800">{tx(notice)}</p>}
  </section>;
}
