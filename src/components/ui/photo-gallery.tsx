"use client";

import { useUiText } from "@/lib/i18n/use-ui-text";
import Image from "next/image";

export function PhotoGallery({ urls, label = "Saved photos" }: { urls?: readonly string[]; label?: string }) {
  const tx = useUiText();
  const photos = urls?.filter((url) => /^\/api\/photos\/[a-f0-9-]{36}$/.test(url));
  if (!photos?.length) return null;
  return <section className="grid gap-3" aria-label={label}>
    <p className="text-sm font-semibold">{label} ({photos.length})</p>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50" aria-label={tx("Open {0} {1}", label.toLowerCase(), index + 1)}>
        <Image src={url} alt={`${label} ${index + 1}`} unoptimized width={480} height={320} className="aspect-[3/2] w-full object-cover" />
      </a>)}
    </div>
  </section>;
}
