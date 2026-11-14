"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";
import Image from "next/image";
import { useId, useState, type ChangeEvent } from "react";
import { photoService, type PhotoPurpose, type UploadedPhoto } from "@/services/photo.service";
import { Camera } from "lucide-react";
import { LiveIcon } from "@/components/motion/live-icon";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function PhotoUpload({ label, purpose, claimId, urls, onChange, onBusyChange, disabled = false, className = "" }: {
  label: string; purpose: PhotoPurpose; claimId?: string; urls: readonly string[];
  onChange: (urls: string[]) => void; onBusyChange?: (busy: boolean) => void; disabled?: boolean; className?: string;
}) {
  const tx = useUiText();
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [library, setLibrary] = useState<UploadedPhoto[]>();
  function working(value: boolean) { setBusy(value); onBusyChange?.(value); }
  async function select(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    setError("");
    if (files.length + urls.length > 5) { setError("সর্বোচ্চ ৫টি ছবি যুক্ত করুন।"); return; }
    if (files.some((f) => !["image/jpeg", "image/png", "image/webp"].includes(f.type) || !f.size || f.size > 5 * 1024 * 1024)) { setError("JPEG, PNG বা WebP ছবি দিন; প্রতি ছবি সর্বোচ্চ ৫ MB।"); return; }
    working(true);
    try {
      const photos = await photoService.upload(files, purpose, claimId);
      onChange([...urls, ...photos.map((p) => p.url)]);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Upload failed. Try again."); }
    finally { working(false); }
  }
  async function remove(url: string) {
    working(true); setError("");
    try { await photoService.remove(url); onChange(urls.filter((u) => u !== url)); setLibrary((current) => current?.filter((p) => p.url !== url)); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Photo could not be removed."); }
    finally { working(false); }
  }
  async function previousUploads() {
    working(true); setError("");
    try { setLibrary(await photoService.unused(purpose, claimId)); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Photos could not load."); }
    finally { working(false); }
  }
  return <div className={`grid gap-3 ${className}`}>
    <label htmlFor={id} className="flex items-center gap-2 text-sm font-bold"><LiveIcon icon={Camera} signal={urls.join(",")} size={21} className="shrink-0 text-emerald-700" />{label} ({urls.length}/5)</label>
    <input id={id} type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy || disabled || urls.length >= 5} onChange={(event) => void select(event)} aria-describedby={`${id}-hint`} aria-invalid={Boolean(error)} className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-100 file:px-3 file:py-2 file:text-emerald-900" />
    <p id={`${id}-hint`} className="text-xs text-muted-600">{tx("JPEG / PNG / WebP · সর্বোচ্চ ৫ MB প্রতি ছবি। কেবল খাবার/প্যাকেজিংয়ের ছবি দিন; মানুষের ছবি হলে সম্মতি নিন।")}</p>
    {busy && <LoadingSpinner label={tx("ছবি সংরক্ষণ হচ্ছে…")} />}
    {error && <p role="alert" className="text-sm text-red-700">{tx(error)}</p>}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {urls.map((url, index) => <div key={url} className="overflow-hidden rounded-xl border border-slate-200">
        <Image src={url} unoptimized width={400} height={280} alt={`${label} ${index + 1}`} className="aspect-[3/2] w-full object-cover" />
        <button type="button" onClick={() => void remove(url)} disabled={busy || disabled} className="w-full bg-white p-2 text-xs font-semibold text-red-700">{tx("Remove photo")}{" "}{index + 1}</button>
      </div>)}
    </div>
    <button type="button" disabled={busy || disabled} onClick={() => void previousUploads()} className="justify-self-start text-sm font-semibold text-emerald-800 underline">{tx("আগে upload করা ছবি দেখুন")}</button>
    {library && <div className="grid gap-3 rounded-xl border border-slate-200 p-3">
      <p className="text-xs text-muted-600">{tx("কোনো record-এ save হয়নি এমন আপনার ছবিগুলো।")}</p>
      {!library.filter((p) => !urls.includes(p.url)).length && <p className="text-sm">{tx("আর কোনো unused photo নেই।")}</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {library.filter((p) => !urls.includes(p.url)).map((photo) => <div key={photo.id} className="overflow-hidden rounded-xl border border-slate-200">
          <Image src={photo.url} unoptimized width={400} height={280} alt={photo.name} className="aspect-[3/2] w-full object-cover" />
          <div className="flex flex-wrap gap-2 p-2">
            <button type="button" disabled={busy || disabled || urls.length >= 5} onClick={() => onChange([...urls, photo.url])} className="text-xs font-semibold text-emerald-800">{tx("Attach photo")}</button>
            <button type="button" disabled={busy || disabled} onClick={() => void remove(photo.url)} className="text-xs font-semibold text-red-700">{tx("Delete unused photo")}</button>
          </div>
        </div>)}
      </div>
    </div>}
  </div>;
}
