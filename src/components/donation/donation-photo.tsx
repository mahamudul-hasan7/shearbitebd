"use client";

import { useUiText } from "@/lib/i18n/use-ui-text";
import Image, { type ImageProps } from "next/image";
import { donationImageUrl } from "@/features/donations/donation-presentation";
import { sampleDonationImage } from "@/lib/sample-donation-images";
import type { DonationView } from "@/types/domain";

export function DonationPhoto({ donation, ...props }: { donation: DonationView } & Omit<ImageProps, "src" | "alt" | "unoptimized">) {
  const tx = useUiText();
  const src = donationImageUrl(donation);
  const sample = sampleDonationImage(donation.sampleImageId);
  const isSample = Boolean(sample && sample.url === src);
  return <>
    <Image {...props} src={src} alt={isSample ? tx("Sample image: {0} — illustrative, not an uploaded food photo", tx(sample!.label)) : src.endsWith(".svg") ? tx("Photo not provided") : donation.title} unoptimized={src.startsWith("/api/photos/")} />
    {isSample && <span className="pointer-events-none absolute bottom-2 right-2 z-10 rounded-lg border border-amber-300 bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-950 shadow-sm">{tx("Sample image · উদাহরণ ছবি")}</span>}
  </>;
}
